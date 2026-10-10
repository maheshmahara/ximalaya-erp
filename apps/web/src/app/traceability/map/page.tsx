'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface PlotProperties {
  plot_ref: string;
  farmer_name: string;
  district: string;
  elevation_masl: number;
  area_hectares: number;
  variety: string;
  eudr_compliant: boolean;
  deforestation_cutoff: string;
  centroid: [number, number];
}

interface Feature {
  type: string;
  properties: PlotProperties;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export default function CadastralMapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [selectedPlot, setSelectedPlot] = useState<PlotProperties>({
    plot_ref: 'PLOT-GUL-042',
    farmer_name: 'Sita Gurung',
    district: 'Gulmi',
    elevation_masl: 1450,
    area_hectares: 0.42,
    variety: 'Bourbon & Typica',
    eudr_compliant: true,
    deforestation_cutoff: '2020-12-31',
    centroid: [27.987654, 83.432612]
  });

  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // 1. Ensure Leaflet CSS is present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 2. Dynamically load Leaflet script if not on window
    const loadLeafletScript = (): Promise<any> => {
      if ((window as any).L) {
        return Promise.resolve((window as any).L);
      }
      return new Promise((resolve, reject) => {
        const existingScript = document.getElementById('leaflet-js');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve((window as any).L));
          return;
        }
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve((window as any).L);
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    let isSubscribed = true;

    loadLeafletScript().then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      // Prevent duplicate initialization error: clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [27.92, 83.48],
        zoom: 11,
        scrollWheelZoom: false
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Fetch PostGIS spatial GeoJSON
      fetch('http://localhost:8000/spatial/plots')
        .then((res) => res.json())
        .then((data) => {
          if (!isSubscribed || !data || !data.features) return;

          data.features.forEach((feat: Feature) => {
            const props = feat.properties;
            const latLngs = feat.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

            const polygon = L.polygon(latLngs, {
              color: props.eudr_compliant ? '#10b981' : '#ef4444',
              fillColor: props.eudr_compliant ? '#34d399' : '#f87171',
              fillOpacity: 0.35,
              weight: 2
            }).addTo(map);

            polygon.on('click', () => {
              setSelectedPlot(props);
            });

            const marker = L.circleMarker(props.centroid, {
              radius: 6,
              color: '#0284c7',
              fillColor: '#38bdf8',
              fillOpacity: 0.9,
              weight: 2
            }).addTo(map);

            marker.bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px;">
                <strong>${props.plot_ref}</strong><br/>
                ${props.farmer_name} (${props.district})<br/>
                <span style="color: #059669; font-weight: bold;">EUDR Compliant</span>
              </div>
            `);

            marker.on('click', () => {
              setSelectedPlot(props);
            });
          });

          setMapLoaded(true);
        })
        .catch((err) => console.error('Error fetching PostGIS plots:', err));
    }).catch((err) => console.error('Leaflet load error:', err));

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Link href="/dashboard" className="hover:text-sky-400">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Traceability</span>
            <span>/</span>
            <span className="text-sky-400">Cadastral Map</span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-400">
            Compliant (4 Plots)
          </span>
        </div>

        {/* Page Header */}
        <header className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Cadastral & EUDR Provenance Mapping</h1>
            <p className="text-sm text-slate-400 mt-1">
              PostGIS polygon boundaries for Gulmi & Palpa cooperatives (WGS84 EPSG:4326)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/t/PK-2083-0459"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Consumer GS1 Story
            </Link>
            <Link
              href="/batches/PK-2083-0459/audit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg"
            >
              Batch Audit
            </Link>
          </div>
        </header>

        {/* Main Content: Map + Cadastral Inspector Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Viewer Column (2 cols) */}
          <div className="lg:col-span-2 h-[580px] bg-slate-900/40 rounded-3xl border border-slate-800 p-2 shadow-2xl relative overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden" />
          </div>

          {/* Sidebar Cadastral Auditor (1 col) */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
              <span className="text-xs font-mono text-sky-400 block uppercase tracking-wider">
                Cadastral Plot Inspector
              </span>

              <div>
                <h3 className="text-xl font-black text-white">{selectedPlot.plot_ref}</h3>
                <p className="text-xs text-slate-400">{selectedPlot.farmer_name} · {selectedPlot.district} Cooperative</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Elevation</span>
                  <span className="font-bold text-slate-200">{selectedPlot.elevation_masl} MASL</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Area</span>
                  <span className="font-bold text-slate-200">{selectedPlot.area_hectares} Ha</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Varietal</span>
                  <span className="font-bold text-slate-200">{selectedPlot.variety}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">EUDR Cutoff</span>
                  <span className="font-bold text-emerald-400">{selectedPlot.deforestation_cutoff}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>EUDR Art. 9 Verified</span>
                </div>
                <p className="text-emerald-200/80 leading-relaxed text-[11px]">
                  Satellite radar & optical time-series confirm zero forest canopy cover loss since December 31, 2020.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 text-xs font-mono text-slate-400">
              <span className="block font-bold text-slate-300 mb-1">Centroid Coordinates (WGS84)</span>
              <span>Lat: {selectedPlot.centroid[0].toFixed(6)}</span><br />
              <span>Lng: {selectedPlot.centroid[1].toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
