'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Plot {
  code: string;
  farmer: string;
  cooperative: string;
  elevation: number;
  area_ha: number;
  varietal: string;
  eudr_cutoff: string;
  eudr_verified: boolean;
  centroid: [number, number];
  polygon: [number, number][];
}

const PLOTS: Plot[] = [
  {
    code: 'PLOT-GUL-042',
    farmer: 'Sita Gurung',
    cooperative: 'Gulmi Cooperative',
    elevation: 1450,
    area_ha: 0.42,
    varietal: 'Bourbon & Typica',
    eudr_cutoff: '2020-12-31',
    eudr_verified: true,
    centroid: [27.987654, 83.432612],
    polygon: [
      [27.9890, 83.4310],
      [27.9895, 83.4345],
      [27.9860, 83.4350],
      [27.9855, 83.4315],
    ],
  },
  {
    code: 'PLOT-PAL-018',
    farmer: 'Bhim Bahadur Thapa',
    cooperative: 'Palpa Cooperative',
    elevation: 1380,
    area_ha: 0.58,
    varietal: 'Typica',
    eudr_cutoff: '2020-12-31',
    eudr_verified: true,
    centroid: [27.8707, 83.5456],
    polygon: [
      [27.8720, 83.5430],
      [27.8730, 83.5475],
      [27.8690, 83.5480],
      [27.8685, 83.5440],
    ],
  },
  {
    code: 'PLOT-KAV-105',
    farmer: 'Kamala Shrestha',
    cooperative: 'Kavre Cooperative',
    elevation: 1520,
    area_ha: 0.35,
    varietal: 'Yellow Catuai',
    eudr_cutoff: '2020-12-31',
    eudr_verified: true,
    centroid: [27.5833, 85.5167],
    polygon: [
      [27.5850, 85.5150],
      [27.5855, 85.5185],
      [27.5815, 85.5190],
      [27.5810, 85.5155],
    ],
  },
];

export default function TraceabilityMapPage() {
  const [selectedPlot, setSelectedPlot] = useState<Plot>(PLOTS[0]);
  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const overlayLayerRef = useRef<any>(null);
  const polygonLayersRef = useRef<{ [code: string]: any }>({});

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Avoid re-initializing if map already exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current).setView(selectedPlot.centroid, 15);
      mapInstanceRef.current = map;

      // Basemap layers
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri, Earthstar Geographics',
          maxZoom: 19,
        }
      );

      const refLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );

      satLayer.addTo(map);
      refLayer.addTo(map);
      currentTileLayerRef.current = satLayer;
      overlayLayerRef.current = refLayer;

      // Add Polygons
      polygonLayersRef.current = {};
      PLOTS.forEach((plot) => {
        const isCurrent = plot.code === selectedPlot.code;
        const poly = L.polygon(plot.polygon, {
          color: isCurrent ? '#f59e0b' : '#10b981',
          fillColor: isCurrent ? '#f59e0b' : '#10b981',
          fillOpacity: isCurrent ? 0.45 : 0.25,
          weight: isCurrent ? 3 : 2,
        }).addTo(map);

        poly.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #111;">
            <strong>${plot.code}</strong><br/>
            ${plot.farmer} (${plot.cooperative})<br/>
            Area: ${plot.area_ha} Ha · ${plot.elevation} MASL
          </div>
        `);

        poly.on('click', () => {
          setSelectedPlot(plot);
        });

        polygonLayersRef.current[plot.code] = poly;
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer Switching (Satellite vs Streets)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (currentTileLayerRef.current) {
        map.removeLayer(currentTileLayerRef.current);
      }
      if (overlayLayerRef.current) {
        map.removeLayer(overlayLayerRef.current);
      }

      if (mapType === 'satellite') {
        const sat = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { attribution: '&copy; Esri', maxZoom: 19 }
        ).addTo(map);

        const ref = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19 }
        ).addTo(map);

        currentTileLayerRef.current = sat;
        overlayLayerRef.current = ref;
      } else {
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        currentTileLayerRef.current = osm;
        overlayLayerRef.current = null;
      }
    });
  }, [mapType]);

  // Handle Plot Selection Changes (Fly to centroid and highlight)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo(selectedPlot.centroid, 15, { duration: 1.2 });

    PLOTS.forEach((plot) => {
      const poly = polygonLayersRef.current[plot.code];
      if (poly) {
        const isCurrent = plot.code === selectedPlot.code;
        poly.setStyle({
          color: isCurrent ? '#f59e0b' : '#10b981',
          fillColor: isCurrent ? '#f59e0b' : '#10b981',
          fillOpacity: isCurrent ? 0.45 : 0.25,
          weight: isCurrent ? 3 : 2,
        });
        if (isCurrent) {
          poly.openPopup();
        }
      }
    });
  }, [selectedPlot]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="border border-neutral-800 rounded-3xl bg-neutral-900/60 backdrop-blur p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Cadastral & EUDR Provenance Mapping
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              PostGIS polygon boundaries for Gulmi & Palpa cooperatives (WGS84 EPSG:4326)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/lot/PK-2083-GUL-001"
              className="rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-200 border border-neutral-700 transition"
            >
              Consumer GS1 Story
            </Link>
            <Link
              href="/batches/PK-2083-0459/audit"
              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition shadow"
            >
              Batch Audit
            </Link>
          </div>
        </div>

        {/* Map & Plot Inspector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-2 rounded-3xl border border-neutral-800 bg-neutral-900/40 overflow-hidden shadow-2xl relative h-[650px]">
            {/* Satellite / Streets Toggle */}
            <div className="absolute top-4 right-4 z-[1000] flex items-center bg-neutral-900/90 backdrop-blur-md border border-neutral-700 rounded-xl p-1 shadow-2xl">
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mapType === 'satellite'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🛰️</span>
                <span>Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => setMapType('streets')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mapType === 'streets'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>🗺️</span>
                <span>Streets</span>
              </button>
            </div>

            {/* Container where Leaflet attaches */}
            <div ref={mapContainerRef} className="h-full w-full z-0" />
          </div>

          {/* Cadastral Inspector Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur p-6 shadow-2xl space-y-5">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">
                  Cadastral Plot Inspector
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{selectedPlot.code}</h2>
                <p className="text-xs text-neutral-400">
                  {selectedPlot.farmer} · {selectedPlot.cooperative}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block">Elevation</span>
                  <span className="text-sm font-bold text-neutral-100">{selectedPlot.elevation} MASL</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block">Area</span>
                  <span className="text-sm font-bold text-neutral-100">{selectedPlot.area_ha} Ha</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block">Varietal</span>
                  <span className="text-sm font-bold text-neutral-100">{selectedPlot.varietal}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block">EUDR Cutoff</span>
                  <span className="text-sm font-bold text-emerald-400">{selectedPlot.eudr_cutoff}</span>
                </div>
              </div>

              {/* EUDR Verification Badge */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/70 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold font-mono uppercase tracking-wide">
                    EUDR Art. 9 Verified
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                  Satellite radar & optical time-series confirm zero forest canopy cover loss since December 31, 2020.
                </p>
              </div>

              {/* Centroid Coordinates */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-400 space-y-1">
                <div className="text-neutral-500 font-semibold text-[10px] uppercase">
                  Centroid Coordinates (WGS84)
                </div>
                <div className="text-neutral-200">Lat: {selectedPlot.centroid[0]}</div>
                <div className="text-neutral-200">Lng: {selectedPlot.centroid[1]}</div>
              </div>

              {/* Plot Switcher */}
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-mono block mb-2">
                  Switch Active Cadastral Parcel:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PLOTS.map((p) => (
                    <button
                      key={p.code}
                      onClick={() => setSelectedPlot(p)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono transition border ${
                        p.code === selectedPlot.code
                          ? 'bg-amber-600 border-amber-500 text-white font-bold'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      {p.code.split('-')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
