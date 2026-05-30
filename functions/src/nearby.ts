import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) initializeApp();
getFirestore().settings({ ignoreUndefinedProperties: true });

const PLACES_KEY = defineSecret("GOOGLE_PLACES_KEY");

const CACHE_TTL_MS = 10 * 60 * 1000;
const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchNearby";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.location",
  "places.types",
  "places.priceLevel",
  "places.rating",
  "places.userRatingCount",
  "places.formattedAddress",
].join(",");

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

// toFixed(3) 將座標精度限制在小數點後 3 位（約 111 公尺）
// 使用者在此範圍內移動時 key 相同，直接命中快取，不重複呼叫 Places API
// 精度選擇：1 位 ≈ 11km（太粗）、5 位 ≈ 1m（太細）、3 位是省費用與準確度的平衡點
function cacheKey(lat: number, lng: number, radius: number): string {
  return `${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`;
}

export const nearby = onRequest(
  { cors: true, secrets: [PLACES_KEY], maxInstances: 10 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const {
      lat,
      lng,
      radius = 1000,
    } = req.body as {
      lat: unknown;
      lng: unknown;
      radius?: unknown;
    };

    if (typeof lat !== "number" || typeof lng !== "number") {
      res.status(400).json({ error: "lat and lng must be numbers" });
      return;
    }

    const radiusNum = typeof radius === "number" ? radius : 1000;
    const db = getFirestore();
    const key = cacheKey(lat, lng, radiusNum);
    const cacheRef = db.collection("places_cache").doc(key);

    try {
      const cached = await cacheRef.get();
      if (cached.exists) {
        const data = cached.data()!;
        if (Date.now() - (data.cachedAt as number) < CACHE_TTL_MS) {
          res.json({ places: data.places });
          return;
        }
      }

      const apiRes = await fetch(PLACES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_KEY.value(),
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radiusNum,
            },
          },
          includedTypes: ["restaurant"],
          maxResultCount: 20,
          languageCode: "zh-TW",
        }),
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        res.status(502).json({ error: `Places API error: ${errText}` });
        return;
      }

      const json = (await apiRes.json()) as { places?: Record<string, unknown>[] };
      const rawPlaces = json.places ?? [];

      const places = rawPlaces.map((p) => ({
        placeId: p["id"] as string,
        name: (p["displayName"] as { text?: string } | undefined)?.text ?? "",
        lat: (p["location"] as { latitude?: number } | undefined)?.latitude ?? 0,
        lng: (p["location"] as { longitude?: number } | undefined)?.longitude ?? 0,
        types: (p["types"] as string[] | undefined) ?? [],
        priceLevel: PRICE_LEVEL_MAP[p["priceLevel"] as string],
        rating: p["rating"] as number | undefined,
        userRatingsTotal: p["userRatingCount"] as number | undefined,
        vicinity: p["formattedAddress"] as string | undefined,
      }));

      await cacheRef.set({ places, cachedAt: Date.now() });
      res.json({ places });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[nearby] error:", message);
      res.status(500).json({ error: message });
    }
  }
);
