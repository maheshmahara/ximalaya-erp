'use client';

import React, { useState, useMemo } from 'react';
import '@/styles/tokens.css';

export default function DryMillingDashboard() {
  const [parchmentInputKg, setParchmentInputKg] = useState('245.0');
  const [moisturePct, setMoisturePct] = useState(11.2);
  const [waterActivityAw, setWaterActivityAw] = useState(0.585);

  // Screen fractions (kg)
  const [screen19, setScreen19] = useState('65.0');
  const [screen18, setScreen18] = useState('72.0');
  const [screen17, setScreen17] = useState('38.5');
  const [screen16, setScreen16] = useState('10.0');
  const [peaberry, setPeaberry] = useState('8.5');
  const [huskChaff, setHuskChaff] = useState('48.5');
  const [defectRejects, setDefectRejects] = useState('1.5');

  // Moisture lock check
  const isMoistureCompliant = moisturePct >= 10.0 && moisturePct <= 12.0 && waterActivityAw <= 0.65;

  // Mass Balance calculations
  const totalGreenKg = useMemo(() => {
    return (
      (parseFloat(screen19) || 0) +
      (parseFloat(screen18) || 0) +
      (parseFloat(screen17) || 0) +
      (parseFloat(screen16) || 0) +
      (parseFloat(peaberry) || 0)
    );
  }, [screen19, screen18, screen17, screen16, peaberry]);

  const totalOutputKg = useMemo(() => {
    return totalGreenKg + (parseFloat(huskChaff) || 0) + (parseFloat(defectRejects) || 0);
  }, [totalGreenKg, huskChaff, defectRejects]);

  const { varianceKg, variancePct, isAuditPassed } = useMemo(() => {
    const input = parseFloat(parchmentInputKg) || 0;
    const diff = Number((input - totalOutputKg).toFixed(3));
    const pct = input > 0 ? Number(((Math.abs(diff) / input) * 100).toFixed(2)) : 0;
    return {
      varianceKg: diff,
      variancePct: pct,
      isAuditPassed: pct <= 0.5,
    };
  }, [parchmentInputKg, totalOutputKg]);

  return (
    <div className="min-h-screen relative text-neutral-900 dark:text-neutral-100 p-6 md:p-10 font-sans">
      <div className="ambient-glow" />

      <main className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Processing Subsidiary • Dry Mill Core
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">
              Hulling & Mass Balance Audit
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Standard: Max 0.5% Loss
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Repose Silo & Milling Lock (4 cols) */}
          <div className="md:col-span-4 glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                Parchment Infeed
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  isMoistureCompliant
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/20 text-red-600 dark:text-red-400'
                }`}
              >
                {isMoistureCompliant ? 'MILLING UNLOCKED' : 'LOCKED'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
              <span className="text-xs text-neutral-400">Active Repose Lot</span>
              <div className="text-lg font-bold font-mono">P-2083-012</div>
              <div className="text-xs text-neutral-500">Silo Bin: BIN-SILO-01 (45d rest)</div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Parchment Charged Weight (kg)
                </label>
                <input
                  type="number"
                  value={parchmentInputKg}
                  onChange={(e) => setParchmentInputKg(e.target.value)}
                  className="w-full text-2xl font-black font-mono bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-400 block">Moisture Meter (%)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 rounded-lg p-2 mt-1 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-neutral-400 block">Water Activity (aw)</span>
                  <input
                    type="number"
                    step="0.005"
                    value={waterActivityAw}
                    onChange={(e) => setWaterActivityAw(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 rounded-lg p-2 mt-1 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200/40 dark:border-neutral-800/40">
              Safe storage requirement: moisture 10.0%–12.0% and aw ≤ 0.650 prevents mold development during warehouse aging.
            </p>
          </div>

          {/* Card 2: Screen Distribution & Byproducts (8 cols) */}
          <div className="md:col-span-8 glass-panel p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-400 block mb-3">
                Graded Output & Sizing Separation
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-4">
                {[
                  { label: 'Screen 19', val: screen19, set: setScreen19 },
                  { label: 'Screen 18', val: screen18, set: setScreen18 },
                  { label: 'Screen 17', val: screen17, set: setScreen17 },
                  { label: 'Screen 16', val: screen16, set: setScreen16 },
                  { label: 'Peaberry', val: peaberry, set: setPeaberry },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-2.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50"
                  >
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{s.label}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={s.val}
                      onChange={(e) => s.set(e.target.value)}
                      className="w-full font-mono font-bold text-base bg-transparent focus:outline-none mt-1"
                    />
                    <span className="text-[10px] text-neutral-400 font-mono">kg</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-800/50">
                <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-xs text-neutral-400 block">Parchment Husk / Chaff (kg)</span>
                  <input
                    type="number"
                    value={huskChaff}
                    onChange={(e) => setHuskChaff(e.target.value)}
                    className="w-full font-mono font-bold text-xl bg-transparent focus:outline-none mt-1"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <span className="text-xs text-neutral-400 block">Defects / Rejects (kg)</span>
                  <input
                    type="number"
                    value={defectRejects}
                    onChange={(e) => setDefectRejects(e.target.value)}
                    className="w-full font-mono font-bold text-xl bg-transparent focus:outline-none mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Mass Balance Audit Card */}
            <div className="mt-5 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                  Automated Mass-Balance Audit
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    isAuditPassed
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse'
                  }`}
                >
                  {isAuditPassed ? 'PASSED (≤ 0.5%)' : 'VARIANCE HOLD'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block">Total Green Yield:</span>
                  <span className="text-sm font-bold">{totalGreenKg.toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Net Reconciliation:</span>
                  <span className="text-sm font-bold">{totalOutputKg.toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Variance (%):</span>
                  <span
                    className={`text-sm font-bold ${
                      isAuditPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                    }`}
                  >
                    {variancePct}% ({varianceKg > 0 ? `-${varianceKg}` : `+${Math.abs(varianceKg)}`} kg)
                  </span>
                </div>
              </div>
            </div>

            <button
              disabled={!isMoistureCompliant || !isAuditPassed}
              onClick={() => alert(`Milling run committed! Created Graded Green Lot G-2083-012-A.`)}
              className="w-full py-3.5 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all disabled:opacity-40"
            >
              Commit Milling Run & Release Green Coffee Lots
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
