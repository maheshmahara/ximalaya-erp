'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ScaCuppingPage() {
  const [batchId, setBatchId] = useState('BATCH-ESP32-001');
  const [cupperName, setCupperName] = useState('Q-Grader Mahesh');

  // Core 7 attributes (6.00 to 10.00)
  const [fragrance, setFragrance] = useState<number>(8.50);
  const [flavor, setFlavor] = useState<number>(8.50);
  const [aftertaste, setAftertaste] = useState<number>(8.25);
  const [acidity, setAcidity] = useState<number>(8.50);
  const [body, setBody] = useState<number>(8.25);
  const [balance, setBalance] = useState<number>(8.25);
  const [overall, setOverall] = useState<number>(8.50);

  // Cup-based attributes (0 to 5 cups, 2 pts each)
  const [uniformityCups, setUniformityCups] = useState<number>(5);
  const [cleanCupCups, setCleanCupCups] = useState<number>(5);
  const [sweetnessCups, setSweetnessCups] = useState<number>(5);

  // Defects
  const [taints, setTaints] = useState<number>(0);
  const [faults, setFaults] = useState<number>(0);

  // Notes
  const [notes, setNotes] = useState('Jasmine, Bergamot, Himalayan Wild Honey');
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time score calculation
  const totalUniformity = uniformityCups * 2;
  const totalCleanCup = cleanCupCups * 2;
  const totalSweetness = sweetnessCups * 2;
  const defectDeductions = (taints * 2) + (faults * 4);

  const rawTotal = (
    fragrance +
    flavor +
    aftertaste +
    acidity +
    body +
    balance +
    overall +
    totalUniformity +
    totalCleanCup +
    totalSweetness -
    defectDeductions
  );
  const totalScore = Number(rawTotal.toFixed(2));

  let classification = 'COMMERCIAL (< 80.00)';
  let badgeColor = 'bg-rose-950/80 border-rose-700 text-rose-300';

  if (totalScore >= 90.0) {
    classification = 'PRESIDENTIAL SPECIALTY (90+)';
    badgeColor = 'bg-purple-950/80 border-purple-700 text-purple-300';
  } else if (totalScore >= 85.0) {
    classification = 'EXCELLENT SPECIALTY (85 - 89.75)';
    badgeColor = 'bg-emerald-950/80 border-emerald-700 text-emerald-300';
  } else if (totalScore >= 80.0) {
    classification = 'VERY GOOD SPECIALTY (80 - 84.75)';
    badgeColor = 'bg-sky-950/80 border-sky-700 text-sky-300';
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/roasting/cupping/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: batchId,
          cupper_name: cupperName,
          fragrance_aroma: fragrance,
          flavor,
          aftertaste,
          acidity,
          body,
          balance,
          overall,
          uniformity_cups: uniformityCups,
          clean_cup_cups: cleanCupCups,
          sweetness_cups: sweetnessCups,
          taints_count: taints,
          faults_count: faults,
          flavor_notes: notes.split(',').map((n) => n.trim())
        })
      });
      const data = await res.json();
      setSubmittedResult(data);
    } catch (err) {
      console.error('Cupping submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Link href="/dashboard" className="hover:text-amber-400">Dashboard</Link>
            <span>/</span>
            <Link href="/roasting/live" className="hover:text-amber-400">Roasting</Link>
            <span>/</span>
            <span className="text-amber-400">SCA Cupping Protocol</span>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${badgeColor}`}>
            {classification}
          </span>
        </div>

        {/* Header Bar */}
        <header className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">SCA 100-Point Sensory Evaluation</h1>
            <p className="text-sm text-slate-400 mt-1">
              Official Specialty Coffee Association Protocol Scoring Form
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center gap-4 text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Score</span>
              <span className="text-3xl font-black font-mono text-emerald-400">{totalScore}</span>
            </div>
            <div className="border-l border-slate-700 pl-4 text-left font-mono text-xs text-slate-400">
              <span>Defects: <strong className="text-rose-400">-{defectDeductions} pts</strong></span><br />
              <span>Cups: <strong className="text-sky-400">{totalUniformity + totalCleanCup + totalSweetness} / 30 pts</strong></span>
            </div>
          </div>
        </header>

        {/* Main Cupping Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Sensory Attributes (Sliders) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Core Sensory Attributes (Scale 6.00 – 10.00)
              </h2>

              {[
                { label: 'Fragrance / Aroma', val: fragrance, set: setFragrance },
                { label: 'Flavor', val: flavor, set: setFlavor },
                { label: 'Aftertaste', val: aftertaste, set: setAftertaste },
                { label: 'Acidity', val: acidity, set: setAcidity },
                { label: 'Body', val: body, set: setBody },
                { label: 'Balance', val: balance, set: setBalance },
                { label: 'Overall Impression', val: overall, set: setOverall }
              ].map((attr) => (
                <div key={attr.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">{attr.label}</span>
                    <span className="text-amber-400 font-bold text-sm">{attr.val.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="6.00"
                    max="10.00"
                    step="0.25"
                    value={attr.val}
                    onChange={(e) => attr.set(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              ))}
            </div>

            {/* Cup Scoring Section */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                5-Cup Integrity Evaluator (2 pts per cup)
              </h2>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-slate-400 block">Uniformity</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setUniformityCups(i)}
                        className={`w-6 h-6 rounded-full text-[10px] font-bold font-mono transition-all ${
                          i <= uniformityCups ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400 block">{totalUniformity} / 10 pts</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-slate-400 block">Clean Cup</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCleanCupCups(i)}
                        className={`w-6 h-6 rounded-full text-[10px] font-bold font-mono transition-all ${
                          i <= cleanCupCups ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 block">{totalCleanCup} / 10 pts</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs font-mono text-slate-400 block">Sweetness</span>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSweetnessCups(i)}
                        className={`w-6 h-6 rounded-full text-[10px] font-bold font-mono transition-all ${
                          i <= sweetnessCups ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 block">{totalSweetness} / 10 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Cupper Meta & Submission */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Cupping Meta</h2>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Batch Code</label>
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Q-Grader / Evaluator</label>
                <input
                  type="text"
                  value={cupperName}
                  onChange={(e) => setCupperName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Flavor Notes (Comma separated)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Taints (-2 pts)</label>
                  <input
                    type="number"
                    min="0"
                    value={taints}
                    onChange={(e) => setTaints(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-rose-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Faults (-4 pts)</label>
                  <input
                    type="number"
                    min="0"
                    value={faults}
                    onChange={(e) => setFaults(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-rose-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-xl"
              >
                {isSubmitting ? 'Submitting Evaluation...' : 'Commit SCA Cupping Score'}
              </button>
            </div>

            {submittedResult && (
              <div className="p-5 rounded-3xl bg-emerald-950/60 border border-emerald-700/80 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  ✓ SCA SCORE RECORDED
                </span>
                <p className="text-xs text-emerald-200">
                  Batch <strong className="text-white">{submittedResult.batch_id}</strong> certified at{' '}
                  <strong className="text-emerald-400">{submittedResult.evaluation.total_score} points</strong> (
                  {submittedResult.evaluation.classification}).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
