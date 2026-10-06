'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const CadastralMap = dynamic(() => import('../../../components/CadastralMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 font-mono text-sm">
      Loading PostGIS WGS84 Satellite Layer...
    </div>
  ),
});

export default function TraceabilityMapPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cadastral & EUDR Provenance Mapping</h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time PostGIS polygon visualization for Gulmi and Palpa micro-lots.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Compliant (4 Plots)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Flagged (0)
            </span>
          </div>
        </header>

        <CadastralMap />
      </div>
    </div>
  );
}
