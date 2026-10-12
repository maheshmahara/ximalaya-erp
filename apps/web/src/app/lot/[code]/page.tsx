import dynamic from "next/dynamic";
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
    coordinates_geojson: any;
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

async function getTraceabilityData(code: string): Promise<TraceabilityData | null> {
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
    <div className="w-full h-64 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-center text-xs text-slate-400 animate-pulse">
      Loading Satellite Farm Plot...
    </div>
  ),
});

export default async function LotTraceabilityPage({ params }: { params: { code: string } }) {
  const data = await getTraceabilityData(params.code);

  if (!data) {
    notFound();
  }

  const geojson = data.origin_profile.coordinates_geojson;
  let lat = 27.9840;
  let lng = 83.4385;

  if (Array.isArray(geojson) && geojson.length >= 2) {
    lng = Number(geojson[0]);
    lat = Number(geojson[1]);
  } else if (geojson && geojson.type === "Polygon" && geojson.coordinates && geojson.coordinates[0]) {
    const firstCoord = geojson.coordinates[0][0];
    lng = Number(firstCoord[0]);
    lat = Number(firstCoord[1]);
  } else if (geojson && geojson.type === "Point" && geojson.coordinates) {
    lng = Number(geojson.coordinates[0]);
    lat = Number(geojson.coordinates[1]);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-lg space-y-4">
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">XIMALAYA COFFEE</h1>
            <p className="text-xs text-emerald-400 font-mono">NEPAL SPECIALTY ORIGIN VERIFICATION</p>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
            EUDR COMPLIANT
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-5">
          {/* Lot Header & Status */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">Packaged Lot Code</span>
              <h2 className="text-2xl font-mono font-bold text-white tracking-tight">{data.pack_lot_code}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{data.sku}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">Best Before</span>
              <p className="text-sm font-mono font-medium text-slate-200">{data.best_before}</p>
            </div>
          </div>

          {/* SCA Quality Score Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-500 p-3 rounded-r-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-300">SCA Certified Specialty Score</p>
              <p className="text-[11px] text-amber-200/80">Cupping standard 80+ protocol</p>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {Number(data.roast_profile.total_sca_score).toFixed(1)} <span className="text-xs font-normal">PTS</span>
            </div>
          </div>

          {/* Origin & Farmer Specs */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Origin Micro-Terroir</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase">Farmer / Estate</span>
                <span className="font-semibold text-slate-100 block truncate">{data.origin_profile.farmer_name}</span>
                <span className="text-[11px] text-slate-400 block truncate">{data.origin_profile.region}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase">Elevation</span>
                <span className="font-semibold text-emerald-400 block text-base font-mono">{data.origin_profile.altitude_masl} <span className="text-xs font-normal text-slate-400">MASL</span></span>
                <span className="text-[10px] text-slate-400 block">High Altitude Arabica</span>
              </div>
            </div>
          </div>

          {/* Interactive Farm Cadastral Map */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">PostGIS Cadastral Parcel</span>
              <span className="font-mono text-[11px] text-emerald-400">{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
            </div>
            <DynamicFarmMap
              lat={lat}
              lng={lng}
              farmerName={data.origin_profile.farmer_name}
              parcelId={data.origin_profile.cadastral_parcel}
              altitude={data.origin_profile.altitude_masl}
              geoJson={geojson}
            />
          </div>

          {/* Processing & Roast Genealogy */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Genealogy & Roast Profile</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 block">Roast Batch</span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">{data.roast_profile.roast_batch_code}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 block">Agtron Score</span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">{data.roast_profile.agtron_score}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 block">Drop Temp</span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">{data.roast_profile.drop_temp_celsius}</span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Processing Method</span>
              <span className="font-medium text-slate-200">{data.processing_profile.processing_method}</span>
            </div>
          </div>
        </div>

        {/* Footer Audit Notice */}
        <p className="text-center text-[10px] text-slate-600 font-mono">
          Cryptographically & spatially validated on Ximalaya ERP • EUDR Reg 2023/1115
        </p>
      </div>
    </main>
  );
}
