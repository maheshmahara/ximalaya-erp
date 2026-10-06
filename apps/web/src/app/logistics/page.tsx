'use client';

import React, { useState, useMemo } from 'react';
import '@/styles/tokens.css';

export default function LogisticsDashboard() {
  const [selectedTrip, setSelectedTrip] = useState<'TRIP_GULMI' | 'TRIP_PALPA'>('TRIP_GULMI');
  const [receivedKg, setReceivedKg] = useState('1244.5');
  const [supervisorNote, setSupervisorNote] = useState('');

  const tripProfiles = {
    TRIP_GULMI: {
      code: 'TRIP-2083-0318',
      waybill: 'WB-2083-0318',
      plate: 'Lu 1 Kha 2345',
      driver: 'Kiran Thapa',
      phone: '9857098765',
      origin: 'Ruru Sahakari, Gulmi',
      loadedKg: 1250.0,
      dispatchedAt: '07:30 AM',
      elapsedHours: 4.5,
    },
    TRIP_PALPA: {
      code: 'TRIP-2083-0319',
      waybill: 'WB-2083-0319',
      plate: 'Ba 2 Cha 9876',
      driver: 'Manish Shrestha',
      phone: '9847123456',
      origin: 'Madanpokhara, Palpa',
      loadedKg: 850.0,
      dispatchedAt: '09:00 AM',
      elapsedHours: 3.0,
    },
  };

  const activeTrip = tripProfiles[selectedTrip];

  // Real-time Transit Loss Variance calculation
  const { lossKg, lossPct, isLossCompliant } = useMemo(() => {
    const rec = parseFloat(receivedKg) || 0;
    const diff = Number((activeTrip.loadedKg - rec).toFixed(2));
    const pct = activeTrip.loadedKg > 0 ? Number(((diff / activeTrip.loadedKg) * 100).toFixed(2)) : 0;
    return {
      lossKg: diff,
      lossPct: pct,
      isLossCompliant: pct <= 1.0,
    };
  }, [activeTrip.loadedKg, receivedKg]);

  return (
    <div className="min-h-screen relative text-neutral-900 dark:text-neutral-100 p-6 md:p-10 font-sans">
      <div className="ambient-glow" />

      <main className="max-w-6xl mx-auto space-y-6 relative z-10">
        <header className="flex justify-between items-center pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Procurement Subsidiary • Inbound Logistics
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">
              Waybill Tracking & Transit Loss Control
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Standard: Max 1.0% Transit Loss
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Active Inbound Fleet Trips (5 cols) */}
          <div className="md:col-span-5 glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                Active Fleet Dispatches
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded font-bold bg-neutral-200/60 dark:bg-neutral-800/60">
                2 Trips En Route
              </span>
            </div>

            <div className="space-y-2">
              {(['TRIP_GULMI', 'TRIP_PALPA'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTrip(key);
                    setReceivedKg(key === 'TRIP_GULMI' ? '1244.5' : '840.0');
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    selectedTrip === key
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-neutral-200/60 dark:border-neutral-800/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm font-mono">{tripProfiles[key].plate}</span>
                    <span className="font-mono text-neutral-400">{tripProfiles[key].code}</span>
                  </div>
                  <div className="text-neutral-500 mt-1">
                    {tripProfiles[key].origin} • {tripProfiles[key].loadedKg} kg loaded
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-2 pt-1 border-t border-neutral-200/30 dark:border-neutral-800/30">
                    <span>Driver: {tripProfiles[key].driver}</span>
                    <span>Transit: {tripProfiles[key].elapsedHours}h</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/50 space-y-1.5 text-xs">
              <div className="font-bold uppercase text-[10px] text-neutral-400">Celery Beat Monitor</div>
              <p className="text-[11px] text-neutral-500">
                Trips are pinged every 5 minutes against route waypoints to ensure raw cherries reach wet milling inside the 8-hour cutoff.
              </p>
            </div>
          </div>

          {/* Card 2: Plant Gate Scale Handover & Loss Check (7 cols) */}
          <div className="md:col-span-7 glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-neutral-400 block">
                    Plant Gate Intake Scale
                  </span>
                  <h3 className="text-lg font-bold">{activeTrip.waybill}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-500 font-bold">
                    Vehicle: {activeTrip.plate}
                  </span>
                </div>
              </div>

              {/* Weight Comparison */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-xs text-neutral-400 block mb-1">Loaded Sourcing Weight</span>
                  <div className="text-2xl font-black font-mono">{activeTrip.loadedKg} kg</div>
                  <span className="text-[11px] text-neutral-500">Recorded at mountain gate</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-xs text-neutral-400 block mb-1">Plant Gate Received (kg)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={receivedKg}
                    onChange={(e) => setReceivedKg(e.target.value)}
                    className="w-full text-2xl font-black font-mono bg-transparent focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-500">Direct scale tare deducted</span>
                </div>
              </div>

              {/* Transit Variance Audit Banner */}
              <div className={`p-4 rounded-xl border space-y-1 ${
                isLossCompliant
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold">Transit Shrinkage Loss:</span>
                  <span className={`text-base font-black ${
                    isLossCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}>
                    {lossPct}% ({lossKg} kg)
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                  <span>Threshold Limit: ≤ 1.00%</span>
                  <span className="font-bold">
                    {isLossCompliant ? 'Status: Normal Moisture Evaporation' : 'Status: VARIANCE BREACH - GATE LOCKED'}
                  </span>
                </div>
              </div>

              {/* Supervisor Override Note (Required if loss > 1.0%) */}
              {!isLossCompliant && (
                <div className="mt-3 space-y-1">
                  <label className="text-xs font-bold text-red-500 block">
                    Supervisor Variance Justification (Mandatory for Override):
                  </label>
                  <textarea
                    rows={2}
                    value={supervisorNote}
                    onChange={(e) => setSupervisorNote(e.target.value)}
                    placeholder="Document reasons for discrepancy (road delay, sack damage, tare offset)..."
                    className="w-full p-2 text-xs bg-white/50 dark:bg-neutral-900/50 border border-red-500/40 rounded-xl focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              disabled={!isLossCompliant && supervisorNote.trim().length === 0}
              onClick={() => alert(`Gate handover approved for Waybill ${activeTrip.waybill}. Lot dispatched to wet mill.`)}
              className="w-full py-3.5 mt-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all disabled:opacity-40"
            >
              {!isLossCompliant && supervisorNote.trim().length === 0
                ? 'Gate Locked: Supervisor Justification Required'
                : `Authorize Gate Handover • ${receivedKg} kg`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
