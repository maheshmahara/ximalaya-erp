"use client";

import React, { useEffect, useRef } from "react";

interface FarmMapProps {
  lat: number;
  lng: number;
  farmerName: string;
  parcelId: string;
  altitude: number;
  geoJson?: any;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function FarmMap({ lat, lng, farmerName, parcelId, altitude, geoJson }: FarmMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

      const satellite = window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri Satellite",
        }
      );

      const streets = window.L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "OpenStreetMap",
        }
      );

      const map = window.L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        layers: [satellite],
      });

      const baseMaps = {
        "🛰️ Satellite": satellite,
        "🗺️ Street": streets,
      };
      window.L.control.layers(baseMaps, null, { position: "topright" }).addTo(map);

      let polygonLayer: any = null;

      if (geoJson && (geoJson.type === "Polygon" || geoJson.type === "MultiPolygon" || geoJson.type === "Feature")) {
        polygonLayer = window.L.geoJSON(geoJson, {
          style: {
            color: "#10B981",
            weight: 2.5,
            opacity: 0.95,
            fillColor: "#059669",
            fillOpacity: 0.28,
            dashArray: "3, 6",
          },
        }).addTo(map);

        try {
          map.fitBounds(polygonLayer.getBounds(), { padding: [30, 30], maxZoom: 17 });
        } catch (e) {
          map.setView([lat, lng], 16);
        }
      } else {
        const fallbackPolygon = [
          [lat + 0.0018, lng - 0.0022],
          [lat + 0.0024, lng + 0.0019],
          [lat - 0.0012, lng + 0.0028],
          [lat - 0.0021, lng - 0.0015],
        ];
        polygonLayer = window.L.polygon(fallbackPolygon, {
          color: "#10B981",
          weight: 2.5,
          opacity: 0.95,
          fillColor: "#059669",
          fillOpacity: 0.28,
          dashArray: "3, 6",
        }).addTo(map);
      }

      const markerIcon = window.L.divIcon({
        className: "custom-div-icon",
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = window.L.marker([lat, lng], { icon: markerIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; color: #0f172a; min-width: 150px;">
          <div style="font-weight: 700; color: #047857; margin-bottom: 2px;">EUDR VERIFIED PLOT</div>
          <div style="font-weight: 600;">${farmerName}</div>
          <div style="color: #64748b;">Parcel: <code>${parcelId}</code></div>
          <div style="color: #64748b;">Altitude: <b>${altitude} MASL</b></div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      mapInstanceRef.current = map;
    };

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
  }, [lat, lng, farmerName, parcelId, altitude, geoJson]);

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] text-slate-300 flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-mono">{parcelId}</span>
        <span className="text-slate-500">•</span>
        <span>{altitude} MASL</span>
      </div>
    </div>
  );
}
