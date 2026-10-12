"use client";

import React, { useEffect, useRef } from "react";

interface FarmMapProps {
  lat: number;
  lng: number;
  farmerName: string;
  parcelId: string;
  altitude: number;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function FarmMap({ lat, lng, farmerName, parcelId, altitude }: FarmMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // 1. Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

      // Base Layer 1: High-Resolution Satellite (Esri World Imagery)
      const satellite = window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri Satellite",
        }
      );

      // Base Layer 2: OpenStreetMap Standard
      const streets = window.L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "OpenStreetMap",
        }
      );

      // Initialize map with Satellite as default
      const map = window.L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: false,
        attributionControl: false,
        layers: [satellite],
      });

      // Layer Control (Switcher top-right)
      const baseMaps = {
        "🛰️ Satellite": satellite,
        "🗺️ Street": streets,
      };
      window.L.control.layers(baseMaps, null, { position: "topright" }).addTo(map);

      // Cadastral Parcel Polygon
      const polygonCoords = [
        [lat + 0.0018, lng - 0.0022],
        [lat + 0.0024, lng + 0.0019],
        [lat - 0.0015, lng + 0.0025],
        [lat - 0.0022, lng - 0.0016],
      ];

      window.L.polygon(polygonCoords, {
        color: "#34d399",
        fillColor: "#059669",
        fillOpacity: 0.35,
        weight: 2,
        dashArray: "4, 4",
      }).addTo(map);

      // Farmer Marker & Popup
      const marker = window.L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;color:#1e293b;line-height:1.4;">
          <strong style="color:#0f172a;display:block;">${farmerName}</strong>
          <div>Parcel: <b>${parcelId}</b></div>
          <div>Elevation: <b>${altitude} MASL</b></div>
        </div>
      `);

      mapInstanceRef.current = map;
    };

    // 2. Inject Leaflet JS if not loaded
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, farmerName, parcelId, altitude]);

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 shadow-inner z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
