'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PackagingCockpit() {
  const [parentRoastBatch, setParentRoastBatch] = useState('BATCH-ESP32-001');
  const [pkgBatchId, setPkgBatchId] = useState('PKG-2083-0459-D1');
  const [roastedInputKg, setRoastedInputKg] = useState<number>(10.0);
  const [boxesProduced, setBoxesProduced] = useState<number>(140);
  const [damagedSachets, setDamagedSachets] = useState<number>(3);
  const [residualO2, setResidualO2] = useState<number>(0.32);

  const [submittedRun, setSubmittedRun] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived metrics
  const netFinishedKg = Number(((boxesProduced * 70.0) / 1000.0).toFixed(2));
  const totalSachets = (boxesProduced * 7) + damagedSachets;
  const rejectPct = totalSachets > 0 ? Number(((damagedSachets / totalSachets) * 100).toFixed(2)) : 0;
  const isO2Compliant = residualO2 <= 0.50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('http://localhost:8000/packaging/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packaging_batch_id: pkgBatchId,
          parent_roast_batch_id: parentRoastBatch,
          roasted_coffee_input_kg: Number(roastedInputKg),
          finished_boxes_produced: Number(boxesProduced),
          residual_o2_reading_pct: Number(residualO2),
          damaged_sachets_count: Number(damagedSachets)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Packaging run submission failed');
      }
      setSubmittedRun(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Link href="/dashboard" className="hover:text-amber-400">Dashboard</Link>
            <span>/</span>
            <Link href="/roasting/live" className="hover:text-amber-400">Roasting</Link>
            <span>/</span>
            <span className="text-amber-400">Packaging & Nitrogen QA</span>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            isO2Compliant
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-rose-950/80 border-rose-700 text-rose-300'
          }`}>
            {isO2Compliant ? 'O2 Within Spec (<= 0.50%)' : 'O2 Specification Breach'}
          </span>
        </div>

        {/* Header Bar */}
        <header className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Ultrasonic Drip Bag Line</h1>
            <p className="text-sm text-slate-400 mt-1">
              Nitrogen Flush Modified Atmosphere Packaging (MAP) & QA Gate
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Net Output</span>
              <span className="text-xl font-bold text-amber-400">{netFinishedKg} kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Residual O2</span>
              <span className={`text-xl font-bold ${isO2Compliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                {residualO2}%
              </span>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-700/80 text-rose-300 text-xs font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form and Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Packaging Run Input</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Packaging Lot Code</label>
                <input
                  type="text"
                  value={pkgBatchId}
                  onChange={(e) => setPkgBatchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Parent Roast Batch</label>
                <input
                  type="text"
                  value={parentRoastBatch}
                  onChange={(e) => setParentRoastBatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Roasted Coffee Input (kg)</label>
                <input
                  type="number"
                  step="0.05"
                  value={roastedInputKg}
                  onChange={(e) => setRoastedInputKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Boxes Produced (7x10g / box)</label>
                <input
                  type="number"
                  value={boxesProduced}
                  onChange={(e) => setBoxesProduced(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Damaged / Purged Sachets</label>
                <input
                  type="number"
                  min="0"
                  value={damagedSachets}
                  onChange={(e) => setDamagedSachets(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Residual O2 Analyzer Reading (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="21.0"
                  value={residualO2}
                  onChange={(e) => setResidualO2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-xl mt-4"
            >
              {isSubmitting ? 'Verifying & Posting...' : 'Commit Packaging Lot & Clear QA'}
            </button>
          </form>

          {/* Verification & Real-time QA Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Mass-Balance Check</h2>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Roasted Input:</span>
                  <span className="font-bold text-white">{roastedInputKg} kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Finished Product Net:</span>
                  <span className="font-bold text-amber-400">{netFinishedKg} kg</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Process Retention:</span>
                  <span className="font-bold text-emerald-400">
                    {roastedInputKg > 0 ? ((netFinishedKg / roastedInputKg) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Sachet Defect Rate:</span>
                  <span className={`font-bold ${rejectPct <= 1.5 ? 'text-slate-200' : 'text-rose-400'}`}>
                    {rejectPct}% (Max 1.5%)
                  </span>
                </div>
              </div>
            </div>

            {submittedRun && (
              <div className="p-5 rounded-3xl bg-emerald-950/60 border border-emerald-700/80 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  ✓ RUN COMMITTED TO FINISHED GOODS
                </span>
                <p className="text-xs text-emerald-200 leading-relaxed font-mono">
                  Batch <strong>{submittedRun.packaging_batch_id}</strong> cleared with status{' '}
                  <strong className="text-white">{submittedRun.status}</strong>. Residual O2:{' '}
                  <strong className="text-emerald-400">{submittedRun.residual_o2_reading_pct}%</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
