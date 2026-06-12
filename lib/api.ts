import {
  AnalyzeResponseSchema,
  NearbyResponseSchema,
  type Place,
  type PlaceAnalysis,
  type UserContext,
} from "./schemas";

const FUNCTIONS_BASE =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:5001/search-food-497209/us-central1"
    : "https://us-central1-search-food-497209.cloudfunctions.net";

export async function fetchNearby(lat: number, lng: number, radius: number): Promise<Place[]> {
  const res = await fetch(`${FUNCTIONS_BASE}/nearby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, radius }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error((err as { error?: string }).error ?? "Network error");
  }

  return NearbyResponseSchema.parse(await res.json()).places;
}

export async function fetchAnalyze(
  places: Place[],
  userContext: UserContext
): Promise<PlaceAnalysis[]> {
  const res = await fetch(`${FUNCTIONS_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ places, userContext }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error((err as { error?: string }).error ?? "Network error");
  }

  return AnalyzeResponseSchema.parse(await res.json()).analyses;
}
