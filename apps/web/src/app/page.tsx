'use client';
import React, { useState } from 'react';
import '@/styles/tokens.css';
import { IntakeGateWidget } from '@/components/dashboard/IntakeGateWidget';
import { FermentationTelemetryWidget } from '@/components/dashboard/FermentationTelemetryWidget';
import { SensoryLineageWidget } from '@/components/dashboard/SensoryLineageWidget';

export default function ExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'procurement' | 'processing' | 'sales'>('overview');

  return (
    <div className="min-h-screen relative text-neutral-900 dark:text-neutral-100 p-6 md:p-10">
      <div className="ambient-glow" />
      <main className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">Ximalaya Coffee Group • Enterprise Command</div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">Operations Cockpit</h1>
          </div>
          <div className="flex items-center p-1 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 backdrop-blur-md">
            {(['overview', 'procurement', 'processing', 'sales'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5 min-h-[340px]">
            <IntakeGateWidget />
          </div>
          <div className="md:col-span-7 min-h-[340px]">
            <FermentationTelemetryWidget />
          </div>
          <div className="md:col-span-6 min-h-[320px]">
            <SensoryLineageWidget />
          </div>
          <div className="md:col-span-6 min-h-[320px] glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">Commercial Ledger</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">13% VAT IRD: Synced</span>
              </div>
              <div className="grid grid-cols-2 gap-4 my-3">
                <div className="p-4 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-xs text-neutral-400">Revenue (ex-VAT)</span>
                  <div className="text-2xl font-black mt-1 font-mono">Rs 6,48,200</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+12% vs Mangsir</span>
                </div>
                <div className="p-4 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-xs text-neutral-400">Coffee Club</span>
                  <div className="text-2xl font-black mt-1 font-mono">146 Active</div>
                  <span className="text-[11px] text-neutral-400">38 renewals due</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center text-xs">
              <span className="text-neutral-500">Overdue receivables: Rs 99,440</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Fulfillment Hold Active</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
