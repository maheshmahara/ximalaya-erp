'use client';

import React, { useState, useMemo } from 'react';
import '@/styles/tokens.css';

export default function RoastingCuppingDashboard() {
  // Batch Telemetry (Ingested via XROS Webhook)
  const [chargedGreenKg] = useState(15.0);
  const [droppedRoastedKg, setDroppedRoastedKg] = useState('12.72');
  const [dropTempC] = useState('214.5');
  const [roastTime] = useState('11m 25s');
  const [agtronColor, setAgtronColor] = useState('62.5');

  // Degassing Rest Countdown (Hours)
  const [degassingHoursRemaining] = useState(18);

  // Digital Cupping Scoresheet Sliders (6.00 to 10.00)
  const [fragrance, setFragrance] = useState(8.75);
  const [flavor, setFlavor] = useState(8.50);
  const [aftertaste, setAftertaste] = useState(8.25);
  const [acidity, setAcidity] = useState(8.50);
  const [body, setBody] = useState(8.25);
  const [balance, setBalance] = useState(8.50);
  const [overall, setOverall] = useState(8.75);

  // Shrinkage Calculation
  const { shrinkagePct, isShrinkageCompliant } = useMemo(() => {
    const dropped = parseFloat(droppedRoastedKg) || 0;
    const diff = chargedGreenKg - dropped;
    const pct = chargedGreenKg > 0 ? Number(((diff / chargedGreenKg) * 100).toFixed(2)) : 0;
    return {
      shrinkagePct: pct,
      isShrinkageCompliant: pct >= 13.5 && pct <= 17.0,
    };
  }, [chargedGreenKg, droppedRoastedKg]);

  // Cupping Total Calculation
  const { totalScore, catalogRouting } = useMemo(() => {
    // 30 points fixed for standard defect-free Uniformity (10), Clean Cup (10), Sweetness (10)
    const base = 30.0;
    const total = Number(
      (base + fragrance + flavor + aftertaste + acidity + body + balance + overall).toFixed(2)
    );
    let routing = 'Commercial Blend';
    if (total >= 84.0) routing = 'Single Origin Specialty';
    else if (total >= 80.0) routing = 'Estate Grade 1';

    return { totalScore: total, catalogRouting: routing };
  }, [fragrance, flavor, aftertaste, acidity, body, balance, overall]);

  return (
    <div className="min-h-screen relative text-neutral-900 dark:text-neutral-100 p-6 md:p-10 font-sans">
      <div className="ambient-glow" />

      <main className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Processing Subsidiary • Roastery Floor
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">
              XROS Roasting & Sensory Release
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Batch: R-2083-0212
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: XROS Machine Drop Telemetry (5 cols) */}
          <div className="md:col-span-5 glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                XROS Webhook Telemetry
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                HMAC VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-2 text-xs">
              <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400 block">Charged Weight</span>
                <span className="text-lg font-black font-mono">{chargedGreenKg} kg</span>
              </div>
              <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400 block">Drop Weight</span>
                <input
                  type="number"
                  step="0.01"
                  value={droppedRoastedKg}
                  onChange={(e) => setDroppedRoastedKg(e.target.value)}
                  className="w-full text-lg font-black font-mono bg-transparent focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400 block">Drop Temp / Time</span>
                <span className="text-sm font-bold font-mono">{dropTempC}°C • {roastTime}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400 block">Agtron Score</span>
                <input
                  type="number"
                  step="0.5"
                  value={agtronColor}
                  onChange={(e) => setAgtronColor(e.target.value)}
                  className="w-full text-sm font-bold font-mono bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Shrinkage Corridor Card */}
            <div className={`p-4 rounded-xl border ${
              isShrinkageCompliant
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30 animate-pulse'
            }`}>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold">Shrinkage Loss:</span>
                <span className={`text-base font-black ${
                  isShrinkageCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}>
                  {shrinkagePct}%
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 block mt-1">
                Target corridor: 13.5% – 17.0%. {isShrinkageCompliant ? 'Normal weight curve.' : 'Out of bounds QA Hold.'}
              </span>
            </div>

            {/* Degassing Rest Timer */}
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800/60 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold block">Degassing Lock (24h-48h)</span>
                <span className="text-neutral-400 text-[11px]">{degassingHoursRemaining}h remaining before packing</span>
              </div>
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold font-mono text-[10px]">
                RESTING
              </span>
            </div>
          </div>

          {/* Card 2: Digital SCA Cupping Scoresheet (7 cols) */}
          <div className="md:col-span-7 glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-neutral-400 block">
                    Q-Grader Sensory Verification
                  </span>
                  <h3 className="text-lg font-bold">Official SCA 100-Point Protocol</h3>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {totalScore.toFixed(2)}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase">
                    {catalogRouting}
                  </span>
                </div>
              </div>

              {/* Interactive Score Sliders */}
              <div className="space-y-3.5 my-2">
                {[
                  { label: 'Fragrance / Aroma', val: fragrance, set: setFragrance },
                  { label: 'Flavor & Nuance', val: flavor, set: setFlavor },
                  { label: 'Aftertaste Finish', val: aftertaste, set: setAftertaste },
                  { label: 'Acidity Brightness', val: acidity, set: setAcidity },
                  { label: 'Body & Mouthfeel', val: body, set: setBody },
                  { label: 'Balance & Harmony', val: balance, set: setBalance },
                  { label: 'Overall Impression', val: overall, set: setOverall },
                ].map((attr) => (
                  <div key={attr.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-neutral-400">{attr.label}</span>
                      <span className="font-mono font-bold">{attr.val.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="6.00"
                      max="10.00"
                      step="0.25"
                      value={attr.val}
                      onChange={(e) => attr.set(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-200/60 dark:bg-neutral-800/60 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert(`Cupping score ${totalScore.toFixed(2)} recorded. Lot released to ${catalogRouting}.`)}
              className="w-full py-3.5 mt-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
            >
              Sign Off Cupping & Release to Catalog
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
