import type { GeoCoords } from "@/lib/schemas";

function haversineMeters(a: GeoCoords, b: GeoCoords): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(s));
}

export function useWalkingTime(user: GeoCoords, place: GeoCoords | null): number | null {
  if (!place) return null;
  return Math.ceil(haversineMeters(user, place) / 80);
}
