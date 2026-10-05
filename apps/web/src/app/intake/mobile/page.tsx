'use client';
import React, { useState, useMemo } from 'react';
import '@/styles/tokens.css';

export default function MobileFieldIntakePWA() {
  const [grossScaleKg, setGrossScaleKg] = useState('144.0');
  const [sackCount, setSackCount] = useState(3);
  const [harvestTime, setHarvestTime] = useState('06:30');
  const [brix, setBrix] = useState(20.5);
  const [floatersPct, setFloatersPct] = useState(3.0);
  const tarePerSackKg = 0.4;

  const calculatedTare = useMemo(() => Number((sackCount * tarePerSackKg).toFixed(3)), [sackCount]);
  const netWeightKg = useMemo(() => Math.max(0, Number(((parseFloat(grossScaleKg) || 0) - calculatedTare).toFixed(3))), [grossScaleKg, calculatedTare]);

  const pulpingDeadline = useMemo(() => {
    const [h, m] = harvestTime.split(':').map(Number);
    return `${((h + 8) % 24).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }, [harvestTime]);

  const { grade, ratePerKg, totalPayable } = useMemo(() => {
    const base = 100.0;
    const isGradeA = brix >= 18.0 && floatersPct <= 5.0;
    const rate = isGradeA ? base + 8.0 : base * 0.9;
    return {
      grade: isGradeA ? 'GRADE A' : 'GRADE B',
      ratePerKg: rate,
      totalPayable: Math.round(netWeightKg * rate),
    };
  }, [brix, floatersPct, netWeightKg]);

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F2F2F7] p-4 flex flex-col justify-between font-sans">
      <div className="space-y-4">
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">● Field Ready</span>
          <span className="text-sm font-bold">New Intake</span>
          <span className="text-xs text-neutral-400">Step 2/3</span>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
          <div className="text-xs text-neutral-400">Supplier</div>
          <div className="font-bold text-base">Sita Gurung • F-GUL-0142</div>
          <div className="text-xs text-neutral-500">Ruru Sahakari • Plot 2 (0.40 ha)</div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 space-y-3">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Gross Scale Weight</span>
            <span className="text-neutral-500">Tare: {calculatedTare} kg</span>
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={grossScaleKg}
              onChange={(e) => setGrossScaleKg(e.target.value)}
              className="text-4xl font-extrabold bg-transparent font-mono w-full focus:outline-none"
            />
            <span className="text-neutral-400 font-bold">kg</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span>Sacks: {sackCount}</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">Net: {netWeightKg.toFixed(1)} kg</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Picked At: <input type="time" value={harvestTime} onChange={(e) => setHarvestTime(e.target.value)} className="bg-transparent font-mono font-bold" /></span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Pulp by: {pulpingDeadline}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <div>Brix: <input type="number" step="0.5" value={brix} onChange={(e) => setBrix(parseFloat(e.target.value) || 0)} className="w-14 font-mono font-bold bg-neutral-100 dark:bg-[#2C2C2E] px-1 py-0.5 rounded" /> °Bx</div>
            <div>Floaters: <input type="number" value={floatersPct} onChange={(e) => setFloatersPct(parseFloat(e.target.value) || 0)} className="w-12 font-mono font-bold bg-neutral-100 dark:bg-[#2C2C2E] px-1 py-0.5 rounded" /> %</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex justify-between items-baseline">
          <div>
            <span className="text-xs text-neutral-400 block">{grade} • Rs {ratePerKg}/kg</span>
            <span className="text-xs font-bold text-neutral-500">Payable Total</span>
          </div>
          <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">Rs {totalPayable.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={() => alert(`Saved intake for ${netWeightKg} kg (Rs ${totalPayable.toLocaleString()})`)}
        className="w-full py-4 mt-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
      >
        Approve & Print Receipt
      </button>
    </div>
  );
}
