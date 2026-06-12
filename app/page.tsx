"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlaces } from "@/hooks/usePlaces";
import { useFilterStore } from "@/store/useFilterStore";
import AnalyzeFilter from "@/app/components/AnalyzeFilter";
import RestaurantCard from "@/app/components/RestaurantCard";
import QuestionnaireOverlay from "@/app/components/QuestionnaireOverlay";
import { fetchAnalyze } from "@/lib/api";
import type { UserContext } from "@/lib/schemas";

const MapView = dynamic(() => import("@/app/components/MapView"), { ssr: false });

export default function Home() {
  const [started, setStarted] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  // ref 防止自動分析重複觸發
  const autoAnalysisFiredRef = useRef(false);

  const { coords, error: geoError, isLoading: geoLoading } = useGeolocation(started);
  // 只有在使用者完成問卷後才開始搜尋
  const {
    places,
    error: placesError,
    isLoading: placesLoading,
  } = usePlaces(userContext ? coords : null, 1000);

  const { analyses, selectedFlavors, selectedDishes, setAnalyses } = useFilterStore();

  const validPlaces = places.filter((p) => !p.types.includes("convenience_store"));

  const analysisMap = new Map(analyses.map((a) => [a.placeId, a]));
  const finalPlaces =
    analyses.length === 0
      ? validPlaces
      : validPlaces.filter((p) => {
          const a = analysisMap.get(p.placeId);
          if (!a) return true;
          const flavorMatch =
            selectedFlavors.length === 0 || a.flavor.some((f) => selectedFlavors.includes(f));
          const dishMatch =
            selectedDishes.length === 0 ||
            a.signature_dishes.some((d) => selectedDishes.includes(d));
          return flavorMatch && dishMatch;
        });

  const topPlaces = [...finalPlaces]
    .sort((a, b) => {
      if (analyses.length > 0) {
        const scoreA = analysisMap.get(a.placeId)?.score ?? 0;
        const scoreB = analysisMap.get(b.placeId)?.score ?? 0;
        return scoreB - scoreA;
      }
      return (b.rating ?? 0) - (a.rating ?? 0);
    })
    .slice(0, 5);

  // 派生值：正在自動分析中（places 已到 + 尚無 analyses + 無錯誤）
  const autoAnalyzing =
    !!userContext &&
    validPlaces.length > 0 &&
    !placesLoading &&
    analyses.length === 0 &&
    !analyzeError;

  // 搜尋完成後自動觸發 AI 分析，只觸發一次
  useEffect(() => {
    if (!autoAnalyzing || autoAnalysisFiredRef.current || !userContext) return;
    autoAnalysisFiredRef.current = true;
    fetchAnalyze(validPlaces, userContext)
      .then(setAnalyses)
      .catch((err) => setAnalyzeError(err instanceof Error ? err.message : "分析失敗"));
  }, [autoAnalyzing, validPlaces, userContext, setAnalyses]);

  function handleReanalyze() {
    if (!userContext) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    fetchAnalyze(validPlaces, userContext)
      .then(setAnalyses)
      .catch((err) => setAnalyzeError(err instanceof Error ? err.message : "分析失敗"))
      .finally(() => setAnalyzing(false));
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
      {/* 問卷 overlay：取得座標後、完成問卷前顯示 */}
      {!userContext && <QuestionnaireOverlay onComplete={setUserContext} />}

      <div className="px-4 py-3 bg-white border-b border-zinc-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-zinc-900">附近餐廳</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {!userContext && "等待問卷..."}
            {userContext && placesLoading && "搜尋餐廳中..."}
            {userContext && (autoAnalyzing || analyzing) && !placesLoading && "AI 分析中..."}
            {userContext && placesError && `搜尋失敗：${placesError}`}
            {userContext &&
              !placesLoading &&
              !autoAnalyzing &&
              !analyzing &&
              !placesError &&
              `顯示 ${finalPlaces.length} / ${validPlaces.length} 間餐廳`}
          </p>
        </div>
        {userContext && analyses.length > 0 && (
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="text-xs px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 font-medium disabled:opacity-50"
          >
            {analyzing ? "分析中..." : "重新分析"}
          </button>
        )}
      </div>
      {analyzeError && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs">{analyzeError}</div>
      )}
      <AnalyzeFilter />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[45vh] shrink-0">
          <MapView center={coords} radius={1000} places={finalPlaces} />
        </div>
        <div className="flex-1 overflow-y-auto bg-zinc-50">
          {!userContext || placesLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-xs text-zinc-400">
                {!userContext ? "請先完成上方問卷" : "搜尋中..."}
              </p>
            </div>
          ) : autoAnalyzing || analyzing ? (
            <div className="flex flex-col items-center justify-center p-8 gap-2">
              <div className="animate-spin text-2xl">✨</div>
              <p className="text-xs text-zinc-400">AI 正在分析餐廳...</p>
            </div>
          ) : finalPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-zinc-400 text-sm">
                {validPlaces.length === 0 ? "附近 1 公里內沒有找到餐廳" : "找不到符合條件的餐廳"}
              </p>
              {validPlaces.length > 0 && (
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
