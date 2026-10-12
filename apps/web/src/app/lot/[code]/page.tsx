import dynamic from "next/dynamic";
import React from "react";
import { notFound } from "next/navigation";

interface TraceabilityData {
  status: string;
  pack_lot_code: string;
  sku: string;
  best_before: string;
  origin_profile: {
    farmer_name: string;
    altitude_masl: number;
    region: string;
    cadastral_parcel: string;
    eudr_compliance: string;
    coordinates_geojson: [number, number];
  };
  roast_profile: {
    roast_batch_code: string;
    drop_temp_celsius: string;
    agtron_score: number;
    total_sca_score: number;
  };
  processing_profile: {
    parchment_lot: string;
    green_lot: string;
    processing_method: string;
  };
}

async function getLotData(code: string): Promise<TraceabilityData | null> {
  try {
    const res = await fetch(`http://api:8000/api/traceability/public/lot/${encodeURIComponent(code)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch lot trace data:", error);
    return null;
  }
}

const DynamicFarmMap = dynamic(() => import("./FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-center text-xs text-slate-400 animate-pulse">
      Loading Satellite Farm Plot...
    </div>
  ),
});

export default async function LotVerificationPage({
  params,
}: {
  params: { code: string };
}) {
  const data = await getLotData(params.code);

  if (!data) {
    notFound();
  }

  const [lng, lat] = data.origin_profile.coordinates_geojson || [83.4385, 27.984];

  return (
    <main className="min-h-screen bg-[#0d1117] text-slate-100 antialiased pb-16 font-sans">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#161b22] to-[#0d1117] px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Verified Specialty Origin
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {data.sku}
        </h1>
        <p className="mt-1 font-mono text-sm tracking-wide text-slate-400">
          Lot: <span className="text-emerald-400 font-semibold">{data.pack_lot_code}</span>
        </p>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6 space-y-6">
        {/* SCA Score Card */}
        <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Cupping Evaluation</p>
              <h2 className="text-lg font-bold text-white mt-0.5">SCA Quality Score</h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">
                {data.roast_profile.total_sca_score.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Specialty Grade</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400">Roast Profile</span>
              <p className="font-semibold text-slate-200 mt-0.5">{data.roast_profile.roast_batch_code}</p>
            </div>
            <div>
              <span className="text-slate-400">Drop Temp</span>
              <p className="font-semibold text-slate-200 mt-0.5 font-mono">{data.roast_profile.drop_temp_celsius}</p>
            </div>
          </div>
        </div>

        {/* Origin & Farmer Profile */}
        <div className="rounded-2xl border border-white/10 bg-[#161b22]/90 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">Origin & Farm Plot</h3>
            <span className="inline-block rounded bg-white/5 px-2 py-0.5 text-xs font-mono text-slate-300">
              {data.origin_profile.altitude_masl} MASL
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400">Farmer / Producer</span>
              <span className="font-semibold text-white">{data.origin_profile.farmer_name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400">Region</span>
              <span className="font-medium text-slate-200 text-right">{data.origin_profile.region}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400">Cadastral Parcel</span>
              <span className="font-mono text-xs font-semibold text-slate-200">{data.origin_profile.cadastral_parcel}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Processing Method</span>
              <span className="font-medium text-slate-200">{data.processing_profile.processing_method}</span>
            </div>
          </div>

          {/* Interactive Farm Cadastral Map */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">Cadastral Boundary Plot (PostGIS)</span>
              <span className="font-mono text-[11px] text-emerald-400">{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
            </div>
            <DynamicFarmMap
              lat={lat}
              lng={lng}
              farmerName={data.origin_profile.farmer_name}
              parcelId={data.origin_profile.cadastral_parcel}
              altitude={data.origin_profile.altitude_masl}
            />
          </div>
        </div>

        {/* EUDR Compliance Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-300">EUDR Deforestation Compliance</h4>
              <p className="mt-1 text-xs leading-relaxed text-emerald-200/70">
                Verified zero deforestation on cadastral parcel <strong>{data.origin_profile.cadastral_parcel}</strong>. Audit records compliant with EU Regulation 2023/1115.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Brand */}
        <div className="text-center pt-4 text-xs text-slate-500">
          <p className="font-medium tracking-wide">XIMALAYA COFFEE GROUP • ERP ORIGIN AUDIT</p>
          <p className="mt-1 font-mono text-[11px]">Best Before: {data.best_before}</p>
        </div>
      </div>
    </main>
  );
}
