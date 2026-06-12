import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { z } from "zod";
import { ALLOWED_ORIGINS, checkRateLimit } from "./utils.js";

const GEMINI_KEY = defineSecret("GEMINI_API_KEY");

const UserContextSchema = z.object({
  budget: z.enum(["<100", "100~200", ">300"]),
  preferences: z.array(z.string()),
});

const SYSTEM_INSTRUCTION = `你是一個在地餐廳推薦專家。根據使用者的預算與偏好，分析提供的餐廳清單。

分析每間餐廳時：
1. **菜系（cuisine）**：優先根據餐廳「名稱 + 地址」推斷，細到料理風格層次（例如：泰北料理、台式熱炒、日式拉麵、港式飲茶），不要直接照抄 Google Maps 的分類標籤。
2. **招牌菜（signature_dishes）**：列出該餐廳「很可能有」的料理（連鎖品牌請用已知菜單；獨立餐廳根據名稱與菜系推斷）。完全不確定時回空陣列，不要捏造。
3. **口味（flavor）**：清淡 / 重口味 / 鹹香 / 甜 / 辣 / 酸 / 鮮，可多選。
4. **摘要（summary）**：一句話中文，包含菜系特色 + 推薦亮點（例如：「道地泰北料理，招牌椒麻雞評價極高，CP值高」）。
5. **推薦分數（score）**：0–100，依照餐廳與使用者條件的符合度打分。評分高、符合預算、符合偏好者得高分。`;

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    analyses: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          placeId: { type: SchemaType.STRING },
          cuisine: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          signature_dishes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          flavor: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          summary: { type: SchemaType.STRING },
          score: { type: SchemaType.NUMBER },
        },
        required: ["placeId", "cuisine", "signature_dishes", "flavor", "summary", "score"],
      },
    },
  },
  required: ["analyses"],
};

const PlaceAnalysisSchema = z.object({
  placeId: z.string(),
  cuisine: z.array(z.string()),
  signature_dishes: z.array(z.string()),
  flavor: z.array(z.string()),
  summary: z.string(),
  score: z.number().min(0).max(100),
});

const AnalyzeResponseSchema = z.object({
  analyses: z.array(PlaceAnalysisSchema),
});

type InputPlace = {
  placeId: string;
  name: string;
  types: string[];
  rating?: number;
  vicinity?: string;
};

async function generateWithRetry(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>,
  prompt: string,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      const isOverload = err instanceof Error && err.message.includes("503");
      if (!isOverload || i === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  throw new Error("unreachable");
}

export const analyze = onRequest(
  { cors: ALLOWED_ORIGINS, secrets: [GEMINI_KEY], maxInstances: 10 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const ip = req.ip ?? "unknown";
    if (!(await checkRateLimit(ip))) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    const { places, userContext } = req.body as { places?: unknown; userContext?: unknown };
    if (!Array.isArray(places) || places.length === 0) {
      res.status(400).json({ error: "places must be a non-empty array" });
      return;
    }

    const contextParsed = UserContextSchema.safeParse(userContext);
    const ctx = contextParsed.success ? contextParsed.data : null;

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY.value());
      const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      });

      const contextLine = ctx
        ? `使用者預算：${ctx.budget} 元\n使用者偏好：${ctx.preferences.length > 0 ? ctx.preferences.join("、") : "無特別偏好"}\n\n`
        : "";

      const placesText = (places as InputPlace[])
        .map(
          (p) =>
            `ID: ${p.placeId}\n名稱: ${p.name}\n類型: ${p.types.join(", ")}\n評分: ${p.rating ?? "無"}\n地址: ${p.vicinity ?? "無"}`
        )
        .join("\n\n");

      const result = await generateWithRetry(
        model,
        `${contextLine}請分析以下餐廳並給出推薦分數：\n\n${placesText}`
      );
      const validated = AnalyzeResponseSchema.parse(JSON.parse(result.response.text()));

      res.json(validated);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[analyze] error:", message);
      res.status(500).json({ error: message });
    }
  }
);
