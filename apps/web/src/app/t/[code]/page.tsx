'use client';

import React, { useState } from 'react';
import '@/styles/tokens.css';

export default function ConsumerProvenancePage({ params }: { params: { code: string } }) {
  const lotCode = params?.code || 'PK-2083-0458';
  const [activeTab, setActiveTab] = useState<'origin' | 'bioprocess' | 'sensory'>('origin');

  const provenance = {
    lotCode: lotCode,
    product: 'Single Origin Himalayan Specialty Drip Box (7 Bags)',
    farmer: {
      name: 'Sita Gurung',
      coop: 'Ruru Coffee Sahakari',
      district: 'Gulmi, Lumbini Province',
      elevation: '1,450 MASL',
      cherryPayout: 'Rs 108.00 / kg',
      gradeBonus: '+Rs 8.00 Grade A Premium',
    },
    eudr: {
      plotRef: 'PLOT-GUL-042',
      area: '0.40 Hectares',
      compliance: 'EUDR Zero-Deforestation Certified',
      cutoffDate: 'Post-2020 Forest Protection Pass',
      coordinates: '27.9840° N, 83.4385° E',
    },
    processing: {
      harvestDate: '2083-08-12',
      method: 'Fully Washed Bioprocess',
      fermentDuration: '36 Hours (pH 4.05 Cutoff)',
      drying: 'Raised African Beds (11.2% Target Moisture)',
      restingSilo: 'Repose Rest 45 Days',
    },
    sensory: {
      roastBatch: 'R-2083-0212',
      agtron: '62.5 Medium-Light',
      scaScore: 84.50,
      classification: 'Specialty Grade 1',
      tastingNotes: ['Wild Honey', 'Red Plum', 'Jasmine', 'Crisp Himalayan Citrus'],
    },
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="ambient-glow" />

      <main className="max-w-xl mx-auto px-5 py-8 space-y-6 relative z-10">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Verified GS1 Digital Link Lineage
          </div>
          <h1 className="text-2xl font-black tracking-tight">{provenance.product}</h1>
          <p className="text-xs font-mono text-neutral-400">Lot: {provenance.lotCode}</p>
        </header>

        <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-xs font-bold text-center">
          {(['origin', 'bioprocess', 'sensory'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 rounded-xl capitalize transition-all ${
                activeTab === tab
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'origin' && (
          <div className="space-y-4">
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
                  SG
                </div>
                <div>
                  <div className="font-extrabold text-base">{provenance.farmer.name}</div>
                  <div className="text-xs text-neutral-400">{provenance.farmer.coop}</div>
                  <div className="text-xs text-emerald-400 font-semibold">
                    {provenance.farmer.district} • {provenance.farmer.elevation}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Direct Farmer Payout:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {provenance.farmer.cherryPayout}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>Quality Incentive:</span>
                  <span>{provenance.farmer.gradeBonus}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                  EUDR Plot Verification
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PASSED
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Cadastral Plot Ref:</span>
                  <span className="font-mono font-semibold">{provenance.eudr.plotRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Surface Area:</span>
                  <span className="font-mono font-semibold">{provenance.eudr.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">WGS84 Coordinates:</span>
                  <span className="font-mono text-emerald-400">{provenance.eudr.coordinates}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500 pt-1 border-t border-white/5">
                  <span>Deforestation Benchmark:</span>
                  <span>{provenance.eudr.cutoffDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bioprocess' && (
          <div className="glass-panel p-5 space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400 block mb-1">
              Precision Wet Mill & Silo Repose
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Harvest Date:</span>
                <span className="font-mono font-bold">{provenance.processing.harvestDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Processing Protocol:</span>
                <span className="font-semibold">{provenance.processing.method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Biochemical Fermentation:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {provenance.processing.fermentDuration}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Parchment Drying:</span>
                <span>{provenance.processing.drying}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Warehouse Aging:</span>
                <span className="font-mono">{provenance.processing.restingSilo}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sensory' && (
          <div className="space-y-4">
            <div className="glass-panel p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                    SCA Official Cupping
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {provenance.sensory.classification}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black font-mono text-emerald-400">
                    {provenance.sensory.scaScore}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Q-Grade Score</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-neutral-400 block mb-2">Validated Tasting Notes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {provenance.sensory.tastingNotes.map((note) => (
                    <span
                      key={note}
                      className="px-2.5 py-1 rounded-xl bg-neutral-900 border border-white/10 text-xs font-semibold text-neutral-200"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5 flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Agtron Color: {provenance.sensory.agtron}</span>
                <span className="text-neutral-400">Batch: {provenance.sensory.roastBatch}</span>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center pt-2 text-[11px] text-neutral-500 font-mono">
          Ximalaya Coffee Group • Vertically Integrated Plant-to-Cup Architecture
        </footer>
      </main>
    </div>
  );
}
