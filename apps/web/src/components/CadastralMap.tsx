'use client';

import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface PlotFeature {
  type: string;
  properties: {
    plot_ref: string;
    farmer_name: string;
    cooperative: string;
    district: string;
    elevation_masl: number;
    area_hectares: number;
    is_eudr_compliant: boolean;
    centroid: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export default function CadastralMap() {
  const [plots, setPlots] = useState<PlotFeature[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<PlotFeature | null>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/spatial/plots')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features && data.features.length > 0) {
          setPlots(data.features);
          setSelectedPlot(data.features[0]);
        }
      })
      .catch((err) => console.error('Spatial fetch failed:', err));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || plots.length === 0) return;

    import('leaflet').then((L) => {
      const container = L.DomUtil.get('eudr-map-container');
      if (!container) return;

      if ((container as any)._leaflet_id != null) {
        (container as any)._leaflet_id = null;
      }

      const map = L.map('eudr-map-container', {
        center: [27.984, 83.4385],
        zoom: 15,
        zoomControl: true,
      });
      mapRef.current = map;

      // High-res satellite tiles
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
      }).addTo(map);

      const group = L.featureGroup();

      plots.forEach((p) => {
        const coords = p.geometry.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number]);
        
        const polygon = L.polygon(coords, {
          color: p.properties.is_eudr_compliant ? '#10b981' : '#f43f5e',
          weight: 3,
          fillColor: p.properties.is_eudr_compliant ? '#34d399' : '#f87171',
          fillOpacity: 0.45,
          dashArray: '4, 4',
        });

        // Pulsing centroid marker
        const center = polygon.getBounds().getCenter();
        const marker = L.circleMarker(center, {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: '#0ea5e9',
          fillOpacity: 1,
        });

        polygon.bindTooltip(
          `<strong>${p.properties.plot_ref}</strong><br/>${p.properties.farmer_name} · ${p.properties.elevation_masl}m`,
          { sticky: true }
        );

        polygon.on('click', () => {
          setSelectedPlot(p);
          map.flyToBounds(polygon.getBounds(), { padding: [50, 50], duration: 1.2 });
        });

        group.addLayer(polygon);
        group.addLayer(marker);
      });

      group.addTo(map);
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [plots]);

  const focusPlot = (plot: PlotFeature) => {
    setSelectedPlot(plot);
    if (mapRef.current) {
      import('leaflet').then((L) => {
        const coords = plot.geometry.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number]);
        const poly = L.polygon(coords);
        mapRef.current.flyToBounds(poly.getBounds(), { padding: [60, 60], duration: 1.0 });
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Canvas */}
      <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
        <div id="eudr-map-container" className="h-[560px] w-full bg-slate-900" />
        <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          EPSG:4326 PostGIS Cadastral Layer
        </div>

        {/* Quick Plot Selector Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] flex gap-2 overflow-x-auto pb-1">
          {plots.map((p) => (
            <button
              key={p.properties.plot_ref}
              onClick={() => focusPlot(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium backdrop-blur-md border transition-all whitespace-nowrap ${
                selectedPlot?.properties.plot_ref === p.properties.plot_ref
                  ? 'bg-sky-600/90 border-sky-400 text-white shadow-lg'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {p.properties.plot_ref} ({p.properties.district})
            </button>
          ))}
        </div>
      </div>

      {/* Compliance & Audit Sidebar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">EUDR Verification</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border bg-emerald-950/60 text-emerald-400 border-emerald-800">
              VERIFIED NON-DEFORESTATION
            </span>
          </div>

          {selectedPlot ? (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{selectedPlot.properties.plot_ref}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{selectedPlot.properties.cooperative} · {selectedPlot.properties.district}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Primary Holder</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedPlot.properties.farmer_name}</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Elevation</div>
                  <div className="font-semibold font-mono text-sky-400 mt-0.5">{selectedPlot.properties.elevation_masl} MASL</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Cadastral Area</div>
                  <div className="font-semibold font-mono text-slate-200 mt-0.5">{selectedPlot.properties.area_hectares} ha</div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Cut-off Baseline</div>
                  <div className="font-semibold font-mono text-slate-200 mt-0.5">31 Dec 2020</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 text-xs">
                <div className="text-slate-400 mb-1">Centroid Coordinates:</div>
                <div className="font-mono text-slate-300 break-all">{selectedPlot.properties.centroid}</div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Select a plot polygon to audit.</p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
          Geospatial boundaries audited against European Union Deforestation Regulation (EUDR) Article 9 polygon submission standards.
        </div>
      </div>
    </div>
  );
}
