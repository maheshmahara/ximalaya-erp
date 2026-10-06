'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stage {
  stage: string;
  stage_name: string;
  facility: string;
  timestamp: string;
  input_weight_kg: number;
  output_weight_kg: number;
  moisture_pct: number;
  loss_pct: number;
  metrics: Record<string, string>;
  status: string;
}

interface GenealogyData {
  batch_code: string;
  origin_plot: string;
  cooperative: string;
  district: string;
  total_initial_cherry_kg: number;
  total_finished_yield_kg: number;
  net_mass_balance_retention_pct: number;
  total_process_loss_pct: number;
  eudr_segregation_mode: string;
  stages: Stage[];
}

export function generateStaticParams() {
  return [{ batchId: 'PK-2083-0459' }];
}

export default function BatchAuditPage({ params }: { params: { batchId: string } }) {
  const batchId = params?.batchId || 'PK-2083-0459';
  const [data, setData] = useState<GenealogyData | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/batches/${batchId}/genealogy`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Genealogy fetch error:', err));
  }, [batchId]);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-sm">
        Loading mass-balance transformation ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Link href="/traceability/map" className="hover:text-sky-400">Traceability</Link>
            <span>/</span>
            <span className="text-slate-200">Batches</span>
            <span>/</span>
            <span className="text-sky-400">{data.batch_code}</span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-400">
            {data.eudr_segregation_mode}
          </span>
        </div>

        <header className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Mass Balance & Genealogy Ledger</h1>
              <p className="text-sm text-slate-400 mt-1">
                Physical transformation audit trail from <strong className="text-slate-200">{data.cooperative} ({data.district})</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Intake Cherry</span>
                <span className="font-bold text-slate-100 text-base">{data.total_initial_cherry_kg} kg</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Final Yield</span>
                <span className="font-bold text-emerald-400 text-base">{data.total_finished_yield_kg} kg</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Yield Retention</span>
                <span className="font-bold text-sky-400 text-base">{data.net_mass_balance_retention_pct}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Cumulative Loss</span>
                <span className="font-bold text-amber-400 text-base">{data.total_process_loss_pct}%</span>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Step-by-Step Transformation Chain
          </h2>

          <div className="space-y-4">
            {data.stages.map((stg, idx) => (
              <div
                key={stg.stage}
                className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-sm relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-950 border border-sky-600 text-sky-400 text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white">{stg.stage_name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                        {stg.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {stg.facility} · <span className="font-mono">{new Date(stg.timestamp).toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Mass Flow</span>
                      <span className="text-slate-200 font-bold">{stg.input_weight_kg} kg → {stg.output_weight_kg} kg</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Moisture</span>
                      <span className="text-sky-400 font-bold">{stg.moisture_pct}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Step Loss</span>
                      <span className="text-rose-400 font-bold">-{stg.loss_pct}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(stg.metrics).map(([k, v]) => (
                    <div key={k} className="text-slate-400">
                      <span className="text-slate-500 capitalize">{k.replace('_', ' ')}: </span>
                      <span className="font-mono text-slate-200 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
