"use client";

import { useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { GeoCoords } from "@/lib/schemas";

interface MapViewProps {
  center: GeoCoords;
  radius?: number;
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

export default function MapView({ center, radius = 1000 }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="greedy"
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ?? "DEMO_MAP_ID"}
      >
        <AdvancedMarker position={center} title="你的位置" />
        <RadiusCircle center={center} radius={radius} />
      </Map>
    </APIProvider>
  );
}
