"use client";

import { useState, useEffect } from "react";
import { fetchNearby } from "@/lib/api";
import type { GeoCoords, Place } from "@/lib/schemas";

interface PlacesResult {
  places: Place[];
  error: string | null;
  isLoading: boolean;
}

export function usePlaces(coords: GeoCoords | null, radius: number): PlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!coords) return;
    let active = true;

    fetchNearby(coords.lat, coords.lng, radius)
      .then((data) => {
        if (!active) return;
        setPlaces(data);
        setFetched(true);
      })
      .catch((err: Error) => {
        if (!active) return;
        console.error("[usePlaces]", err);
        setError(err.message);
        setFetched(true);
      });

    return () => {
      active = false;
    };
  }, [coords, radius]);

  return { places, error, isLoading: !!coords && !fetched };
}
