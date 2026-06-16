/// <reference types="@types/google.maps" />
"use client";

import { useEffect, useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import type { GeoCoords, Place } from "@/lib/schemas";
import { useWalkingTime } from "@/hooks/useWalkingTime";

interface MapViewProps {
  center: GeoCoords;
  radius?: number;
  places?: Place[];
}

function RadiusCircle({ center, radius }: { center: GeoCoords; radius: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      center,
      radius,
      strokeColor: "#2563EB",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: "#2563EB",
      fillOpacity: 0.07,
      map,
    });

    return () => circle.setMap(null);
  }, [map, center, radius]);

  return null;
}

const PRICE = ["", "$", "$$", "$$$", "$$$$"];

export default function MapView({ center, radius = 1000, places = [] }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const walkingMinutes = useWalkingTime(
    center,
    selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : null
  );

  return (
    <APIProvider apiKey={apiKey}>
      <GoogleMap
        style={{ width: "100%", height: "100%" }}
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="greedy"
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ?? "DEMO_MAP_ID"}
        onClick={() => setSelectedPlace(null)}
      >
        <AdvancedMarker position={center} title="你的位置">
          <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md" />
        </AdvancedMarker>

        <RadiusCircle center={center} radius={radius} />

        {places.map((place) => (
          <AdvancedMarker
            key={place.placeId}
            position={{ lat: place.lat, lng: place.lng }}
            title={place.name}
            onClick={() => setSelectedPlace(place)}
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            onCloseClick={() => setSelectedPlace(null)}
            pixelOffset={[0, -40]}
            headerContent={
              <p className="font-semibold text-sm text-zinc-900">{selectedPlace.name}</p>
            }
          >
            <div className="max-w-50 flex flex-col gap-1">
              <p className="text-xs text-zinc-600 font-bold">
                {[
                  selectedPlace.priceLevel ? PRICE[selectedPlace.priceLevel] : null,
                  selectedPlace.rating ? `⭐ ${selectedPlace.rating}` : null,
                  walkingMinutes ? `步行約 ${walkingMinutes} 分鐘` : null,
                ]
                  .filter(Boolean)
                  .join(" - ")}
              </p>
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${selectedPlace.placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                在 Google 地圖上查看
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </APIProvider>
  );
}
