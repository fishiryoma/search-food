import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { z } from "zod";

const GEMINI_KEY = defineSecret("GEMINI_API_KEY");

const SYSTEM_INSTRUCTION = `你是一個餐廳分析助手。根據提供的餐廳資訊，為每間餐廳提取標籤。
- cuisine：菜系，從以下選擇（可多選）：台式、日式、中式、韓式、義式、美式、泰式、法式、港式、東南亞、其他
- flavor：口味特色，從以下選擇（可多選）：清淡、重口味、鹹香、甜、辣、酸、鮮
- occasion：適合場景，從以下選擇（可多選）：家庭聚餐、朋友聚會、約會、商務、獨食、快速午餐
資訊不足時保留空陣列，不要捏造。`;

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
          flavor: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          occasion: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ["placeId", "cuisine", "flavor", "occasion"],
      },
    },
  },
  required: ["analyses"],
};

const PlaceAnalysisSchema = z.object({
  placeId: z.string(),
  cuisine: z.array(z.string()),
  flavor: z.array(z.string()),
  occasion: z.array(z.string()),
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
  { cors: true, secrets: [GEMINI_KEY], maxInstances: 10 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { places } = req.body as { places?: unknown };
    if (!Array.isArray(places) || places.length === 0) {
      res.status(400).json({ error: "places must be a non-empty array" });
      return;
    }

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

      const placesText = (places as InputPlace[])
        .map(
          (p) =>
            `ID: ${p.placeId}\n名稱: ${p.name}\n類型: ${p.types.join(", ")}\n評分: ${p.rating ?? "無"}\n地址: ${p.vicinity ?? "無"}`
        )
        .join("\n\n");

      const result = await generateWithRetry(model, `請分析以下餐廳：\n\n${placesText}`);
      const validated = AnalyzeResponseSchema.parse(JSON.parse(result.response.text()));

      res.json(validated);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[analyze] error:", message);
      res.status(500).json({ error: message });
    }
  }
);
