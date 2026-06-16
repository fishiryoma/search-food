"use client";

import { useState, useEffect } from "react";
import type { GeoCoords } from "@/lib/schemas";

interface GeolocationResult {
  coords: GeoCoords | null;
  error: string | null;
  isLoading: boolean;
}

const ERROR_MESSAGES: Record<number, string> = {
  1: "位置存取被拒絕，請在瀏覽器設定中允許定位",
  2: "無法取得位置資訊",
  3: "取得位置逾時",
};

export function useGeolocation(enabled: boolean): GeolocationResult {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (!("geolocation" in navigator)) {
      Promise.resolve().then(() => setError("此瀏覽器不支援定位功能"));
      return;
    }

    let active = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        if (!active) return;
        setError(ERROR_MESSAGES[err.code] ?? "未知定位錯誤");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => {
      active = false;
    };
  }, [enabled]);

  return { coords, error, isLoading: enabled && !coords && !error };
}
