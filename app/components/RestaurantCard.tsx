"use client";

import type { Place, PlaceAnalysis } from "@/lib/schemas";

const PRICE_LABEL: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface RestaurantCardProps {
  place: Place;
  analysis?: PlaceAnalysis;
  userLat: number;
  userLng: number;
  rank: number;
}

export default function RestaurantCard({
  place,
  analysis,
  userLat,
  userLng,
  rank,
}: RestaurantCardProps) {
  const distKm = haversineKm(userLat, userLng, place.lat, place.lng);
  const distLabel = distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.placeId}`;
  const isTopPick = rank === 1 && analysis !== undefined;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-zinc-50 active:bg-zinc-100 transition-colors border-b border-zinc-100"
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
          isTopPick ? "bg-amber-400 text-white" : "bg-blue-600 text-white"
        }`}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="font-semibold text-zinc-900 text-sm truncate">{place.name}</p>
            {isTopPick && (
              <span className="shrink-0 text-xs bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-md">
                Gemini 首選
              </span>
            )}
          </div>
          <span className="shrink-0 text-xs text-zinc-400">{distLabel}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {place.rating !== undefined && (
            <span className="text-xs text-amber-500 font-medium">★ {place.rating.toFixed(1)}</span>
          )}
          {place.userRatingsTotal !== undefined && (
            <span className="text-xs text-zinc-400">({place.userRatingsTotal})</span>
          )}
          {place.priceLevel !== undefined && (
            <span className="text-xs text-zinc-500">{PRICE_LABEL[place.priceLevel]}</span>
          )}
        </div>
        {analysis && analysis.cuisine.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {analysis.cuisine.map((c) => (
              <span key={c} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        )}
        {analysis?.summary && (
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{analysis.summary}</p>
        )}
        {place.vicinity && !analysis?.summary && (
          <p className="text-xs text-zinc-400 mt-0.5 truncate">{place.vicinity}</p>
        )}
      </div>
    </a>
  );
}
