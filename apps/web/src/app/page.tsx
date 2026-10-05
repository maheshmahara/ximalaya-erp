'use client';
import React, { useState } from 'react';
import '@/styles/tokens.css';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ExecutiveDashboard() {
  const [period, setPeriod] = useState('today');
  return (
    <div className="min-h-screen relative text-neutral-900 dark:text-neutral-100 p-6 md:p-10 font-sans">
      <div className="ambient-wash" />
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center pb-2 border-b border-neutral-200/40">
          <div>
            <div className="text-xs font-mono uppercase text-neutral-500">Ximalaya Coffee Group • FY 2083/84</div>
            <h1 className="text-2xl md:text-3xl font-bold">Executive Cockpit</h1>
          </div>
          <div className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full font-bold">
            All 4 Subsidiaries Active
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <GlassCard className="md:col-span-4 min-h-[200px]">
            <span className="text-xs uppercase text-neutral-500 font-semibold">Cherry Intake Today</span>
            <div className="text-4xl font-black my-2">1,310.4 <span className="text-sm font-normal">kg</span></div>
            <p className="text-xs text-neutral-500">6 deliveries • 8h pulping limit on track</p>
          </GlassCard>
          <GlassCard className="md:col-span-8 min-h-[200px]">
            <span className="text-xs uppercase text-neutral-500 font-semibold">Wet Mill Fermentation Telemetry</span>
            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="p-3 bg-white/40 dark:bg-neutral-900/40 rounded-xl">
                <div className="text-xs font-bold">T1 • Washed</div>
                <div className="text-lg font-black">pH 4.62</div>
              </div>
              <div className="p-3 bg-white/40 dark:bg-neutral-900/40 rounded-xl">
                <div className="text-xs font-bold">T2 • Washed</div>
                <div className="text-lg font-black text-amber-500">pH 4.05</div>
              </div>
              <div className="p-3 bg-white/40 dark:bg-neutral-900/40 rounded-xl">
                <div className="text-xs font-bold">T3 • Anaerobic</div>
                <div className="text-lg font-black">pH 3.92</div>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Target corridor: pH 3.80 - 4.20 before channel washing</p>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
