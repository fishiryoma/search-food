"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePlaces } from "@/hooks/usePlaces";

const MapView = dynamic(() => import("@/app/components/MapView"), { ssr: false });

export default function Home() {
  const [started, setStarted] = useState(false);
  const { coords, error: geoError, isLoading: geoLoading } = useGeolocation(started);
  const { places, error: placesError, isLoading: placesLoading } = usePlaces(coords, 1000);

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
      <div className="px-4 py-3 bg-white border-b border-zinc-100 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">附近餐廳</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          {placesLoading && "搜尋餐廳中..."}
          {placesError && `搜尋失敗：${placesError}`}
          {!placesLoading && !placesError && `找到 ${places.length} 間餐廳`}
        </p>
      </div>
      <div className="flex-1">
        <MapView center={coords} radius={1000} places={places} />
      </div>
    </main>
  );
}
