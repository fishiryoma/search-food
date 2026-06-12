import { z } from "zod";

export const GeoCoordsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoCoords = z.infer<typeof GeoCoordsSchema>;

// M2 以後會完整填充，M1 先定義型別佔位
export const PlaceSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  types: z.array(z.string()),
  priceLevel: z.number().min(1).max(4).optional(),
  rating: z.number().min(0).max(5).optional(),
  userRatingsTotal: z.number().optional(),
  vicinity: z.string().optional(),
});
export type Place = z.infer<typeof PlaceSchema>;

export const NearbyResponseSchema = z.object({
  places: z.array(PlaceSchema),
});

export const UserContextSchema = z.object({
  budget: z.enum(["<100", "100~200", ">300"]),
  preferences: z.array(z.string()),
});
export type UserContext = z.infer<typeof UserContextSchema>;

export const PlaceAnalysisSchema = z.object({
  placeId: z.string(),
  cuisine: z.array(z.string()),
  flavor: z.array(z.string()),
  signature_dishes: z.array(z.string()),
  summary: z.string(),
  score: z.number().min(0).max(100),
});
export type PlaceAnalysis = z.infer<typeof PlaceAnalysisSchema>;

export const AnalyzeResponseSchema = z.object({
  analyses: z.array(PlaceAnalysisSchema),
});
