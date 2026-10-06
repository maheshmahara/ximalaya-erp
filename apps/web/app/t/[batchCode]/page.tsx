'use client';

import React from 'react';
import Link from 'next/link';

export default function ConsumerProvenancePage({ params }: { params: { batchCode: string } }) {
  const batch = params.batchCode || 'PK-2083-0459';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-amber-500 selection:text-black">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-b border-slate-800 pt-10 pb-8 px-6">
        <div className="max-w-md mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <span>GS1 Digital Link</span>
            <span>·</span>
            <span>Batch {batch}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Ximalaya Single Origin
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Cultivated by Sita Gurung in Gulmi, Nepal. Hand-harvested, cold-fermented, and roast-profiled for specialty drip extraction.
          </p>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 mt-6 space-y-6">
        {/* Sensory Score Card */}
        <section className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Sensory Evaluation</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
              SCA 89.00
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400 block">Flavor Notes</span>
              <span className="font-semibold text-slate-200 mt-1 block">Wild Honey, Plum, Jasmine</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400 block">Process</span>
              <span className="font-semibold text-slate-200 mt-1 block">36h Anaerobic Ferment</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400 block">Elevation</span>
              <span className="font-semibold font-mono text-sky-400 mt-1 block">1,450 MASL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-400 block">Varietal</span>
              <span className="font-semibold text-slate-200 mt-1 block">Bourbon & Typica</span>
            </div>
          </div>
        </section>

        {/* Farmer Equity & Economics */}
        <section className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Direct-Trade Transparency</span>
          
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Farm Gate Payout Rate</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">Rs 108.00 / kg</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Quality Bonus (Brix 22.5°)</span>
              <span className="font-mono text-emerald-300 font-bold">+Rs 8.00 / kg</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-emerald-900/40">
              This payout exceeds the national minimum baseline by 18%, rewarding selective picking of ripe cherries.
            </div>
          </div>
        </section>

        {/* EUDR Cadastral Verification */}
        <section className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Deforestation-Free Proof</span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              EUDR Art. 9
            </span>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed">
            Harvested from cadastral polygon <span className="font-mono font-bold text-white">PLOT-GUL-042</span>. Satellite imagery confirms zero deforestation since the December 31, 2020 EU baseline cutoff.
          </div>

          <Link
            href="/traceability/map"
            className="block text-center py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            Inspect Cadastral Boundary on Satellite Map →
          </Link>
        </section>
      </main>
    </div>
  );
}
