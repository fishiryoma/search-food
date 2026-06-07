"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlaces } from "@/hooks/usePlaces";
import { useFilterStore } from "@/store/useFilterStore";
import FilterChips from "@/app/components/FilterChips";
import AnalyzeFilter from "@/app/components/AnalyzeFilter";
import RestaurantCard from "@/app/components/RestaurantCard";
import { fetchAnalyze } from "@/lib/api";

const MapView = dynamic(() => import("@/app/components/MapView"), { ssr: false });

export default function Home() {
  const [started, setStarted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const { coords, error: geoError, isLoading: geoLoading } = useGeolocation(started);
  const { places, error: placesError, isLoading: placesLoading } = usePlaces(coords, 1000);

  const {
    selectedTypes,
    selectedPriceLevels,
    analyses,
    selectedFlavors,
    selectedOccasions,
    setAnalyses,
  } = useFilterStore();

  const filteredPlaces = places.filter((p) => {
    const typeMatch = selectedTypes.length === 0 || p.types.some((t) => selectedTypes.includes(t));
    const priceMatch =
      selectedPriceLevels.length === 0 ||
      (p.priceLevel !== undefined && selectedPriceLevels.includes(p.priceLevel));
    return typeMatch && priceMatch;
  });

  const analysisMap = new Map(analyses.map((a) => [a.placeId, a]));
  const finalPlaces =
    analyses.length === 0
      ? filteredPlaces
      : filteredPlaces.filter((p) => {
          const a = analysisMap.get(p.placeId);
          if (!a) return true;
          const flavorMatch =
            selectedFlavors.length === 0 || a.flavor.some((f) => selectedFlavors.includes(f));
          const occasionMatch =
            selectedOccasions.length === 0 || a.occasion.some((o) => selectedOccasions.includes(o));
          return flavorMatch && occasionMatch;
        });

  const topPlaces = [...finalPlaces].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5);

  async function handleAnalyze() {
    if (filteredPlaces.length === 0) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await fetchAnalyze(filteredPlaces);
      setAnalyses(result);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "分析失敗");
    } finally {
      setAnalyzing(false);
    }
  }

  if (!started) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-50">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-6">🍜</div>
          <h1 className="text-2xl font-bold mb-2 text-zinc-900">附近餐廳推薦</h1>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            找出步行 1 公里內
            <br />
            最適合你的餐廳
          </p>
          <button
            onClick={() => setStarted(true)}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl text-base font-semibold hover:bg-blue-700 active:scale-95 transition-all"
          >
            允許取得位置，開始搜尋
          </button>
          <p className="mt-4 text-xs text-zinc-400">位置資料僅用於搜尋附近餐廳，不會儲存或上傳</p>
        </div>
      </main>
    );
  }

  if (geoLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-3">📍</div>
          <p className="text-zinc-500">正在取得位置...</p>
        </div>
      </main>
    );
  }

  if (geoError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-50">
        <div className="max-w-sm w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-zinc-700 mb-6">{geoError}</p>
          <button onClick={() => setStarted(false)} className="text-blue-600 underline text-sm">
            重試
          </button>
        </div>
      </main>
    );
  }

  if (!coords) return null;

  return (
    <main className="h-screen flex flex-col">
      <div className="px-4 py-3 bg-white border-b border-zinc-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-zinc-900">附近餐廳</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {placesLoading && "搜尋餐廳中..."}
            {placesError && `搜尋失敗：${placesError}`}
            {!placesLoading &&
              !placesError &&
              `顯示 ${finalPlaces.length} / ${places.length} 間餐廳`}
          </p>
        </div>
        {!placesLoading && filteredPlaces.length > 0 && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="text-xs px-3 py-1.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            {analyzing ? "分析中..." : analyses.length > 0 ? "重新分析" : "AI 細篩"}
          </button>
        )}
      </div>
      {analyzeError && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs">{analyzeError}</div>
      )}
      <FilterChips places={places} />
      <AnalyzeFilter />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[45vh] shrink-0">
          <MapView center={coords} radius={1000} places={finalPlaces} />
        </div>
        <div className="flex-1 overflow-y-auto bg-zinc-50">
          {placesLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-xs text-zinc-400">搜尋中...</p>
            </div>
          ) : finalPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-zinc-400 text-sm">
                {places.length === 0 ? "附近 1 公里內沒有找到餐廳" : "找不到符合條件的餐廳"}
              </p>
              {places.length > 0 && (
                <p className="text-zinc-400 text-xs mt-1">請試著放寬篩選條件</p>
              )}
            </div>
          ) : (
            <>
              <p className="px-4 pt-3 pb-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                推薦餐廳（前 {topPlaces.length} 名）
              </p>
              {topPlaces.map((place, i) => (
                <RestaurantCard
                  key={place.placeId}
                  place={place}
                  analysis={analysisMap.get(place.placeId)}
                  userLat={coords.lat}
                  userLng={coords.lng}
                  rank={i + 1}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
