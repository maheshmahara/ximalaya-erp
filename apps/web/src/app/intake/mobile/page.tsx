'use client';

import React, { useState, useEffect } from 'react';
import { 
  saveOfflineIntake, 
  getPendingIntakes, 
  getAllLocalIntakes, 
  markIntakeSynced, 
  IntakeRecord 
} from '@/lib/offlineStore';
import { useSerialScale } from '@/lib/useSerialScale';
import { apiClient } from '@/lib/api';

export default function MobileIntakePage() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [records, setRecords] = useState<IntakeRecord[]>([]);

  // Hardware Web Serial Scale
  const scale = useSerialScale(9600);

  // Form Fields
  const [farmerName, setFarmerName] = useState('Sita Gurung');
  const [farmerPhone, setFarmerPhone] = useState('+977-9847123456');
  const [plotRef, setPlotRef] = useState('PLOT-GUL-042');
  const [harvestHoursAgo, setHarvestHoursAgo] = useState<number>(3.5);
  const [grossWeight, setGrossWeight] = useState<number>(65.0);
  const [tareWeight, setTareWeight] = useState<number>(2.5);
  const [brix, setBrix] = useState<number>(22.0);
  const [floatersPct, setFloatersPct] = useState<number>(1.5);
  const [baseRate, setBaseRate] = useState<number>(100.0);

  // Calculations
  const netWeight = Math.max(0, grossWeight - tareWeight);
  const isGradeAPremium = brix >= 21.0 && floatersPct <= 2.0;
  const premium = isGradeAPremium ? 8.0 : 0.0;
  const finalRate = baseRate + premium;
  const totalPayout = netWeight * finalRate;
  const isBreached = harvestHoursAgo > 8.0;

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); triggerSync(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadRecords();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function loadRecords() {
    try {
      const data = await getAllLocalIntakes();
      setRecords(data);
    } catch (e) {
      console.error('Failed to read IndexedDB', e);
    }
  }

  const captureScaleGross = () => {
    if (scale.liveWeight !== null) {
      setGrossWeight(scale.liveWeight);
    }
  };

  const captureScaleTare = () => {
    if (scale.liveWeight !== null) {
      setTareWeight(scale.liveWeight);
    }
  };

  async function triggerSync() {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    try {
      const pending = await getPendingIntakes();
      for (const item of pending) {
        const res = await apiClient('/api/v1/procurement/intake', {
          method: 'POST',
          body: JSON.stringify({
            farmer_name: item.farmerName,
            plot_code: item.plotRef,
            gross_weight_kg: item.grossWeightKg,
            tare_weight_kg: item.tareWeightKg,
            brix: item.brix,
            floaters_pct: item.floatersPct,
            harvest_timestamp: item.harvestTimestamp
          }),
        });

        if (res.status === 200 || res.status === 201) {
          await markIntakeSynced(item.localId);
        }
      }
      await loadRecords();
    } catch (err) {
      console.warn('Sync attempt encountered network pause', err);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBreached) {
      if (!confirm('Harvest cutoff exceeds 8-hour window! Proceed with QA Quarantine flag?')) {
        return;
      }
    }

    const now = new Date();
    const harvestDate = new Date(now.getTime() - harvestHoursAgo * 60 * 60 * 1000);

    const newRecord: IntakeRecord = {
      localId: `LOCAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      farmerName,
      farmerPhone,
      plotRef,
      harvestTimestamp: harvestDate.toISOString(),
      intakeTimestamp: now.toISOString(),
      grossWeightKg: grossWeight,
      tareWeightKg: tareWeight,
      netWeightKg: netWeight,
      brix,
      floatersPct,
      baseRatePerKg: baseRate,
      premiumPerKg: premium,
      totalPayoutRs: totalPayout,
      syncStatus: 'PENDING',
    };

    await saveOfflineIntake(newRecord);
    await loadRecords();

    if (navigator.onLine) {
      triggerSync();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isOnline ? 'Cloud Link Active' : 'Offline Mode (IndexedDB)'}
          </span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={scale.isConnected ? scale.disconnect : scale.connect}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-xl border transition-all flex items-center gap-2 ${
              scale.isConnected 
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${scale.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {scale.isConnected ? `RS-232: ${scale.liveWeight ?? 0.0} kg` : 'Connect Scale (RS-232)'}
          </button>

          <button
            onClick={triggerSync}
            disabled={isSyncing || !isOnline}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-xs font-bold rounded-xl transition-all"
          >
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </header>

      {/* Main Intake Form */}
      <main className="max-w-md mx-auto space-y-4">
        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-lg space-y-4">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-between">
            <span>Cherry Field Intake</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-sky-400">
              Ruru Sahakari
            </span>
          </h1>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400">Farmer & Registered Plot</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  placeholder="Farmer Name"
                  required
                />
                <select
                  value={plotRef}
                  onChange={(e) => setPlotRef(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="PLOT-GUL-042">PLOT-GUL-042 (Gulmi)</option>
                  <option value="PLOT-GUL-043">PLOT-GUL-043 (Gulmi)</option>
                  <option value="PLOT-PAL-101">PLOT-PAL-101 (Palpa)</option>
                  <option value="PLOT-PAL-102">PLOT-PAL-102 (Palpa)</option>
                </select>
              </div>
            </div>

            {/* 8-Hour Countdown Status */}
            <div>
              <label className="text-xs text-slate-400">Harvest Timeline</label>
              <div className={`p-3 rounded-xl border mt-1 flex justify-between items-center ${
                isBreached ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              }`}>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold">
                    {isBreached ? 'Deadline Breached' : '8h Window Valid'}
                  </div>
                  <div className="text-xs opacity-75 font-mono">{harvestHoursAgo} hrs since picking</div>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.5"
                  value={harvestHoursAgo}
                  onChange={(e) => setHarvestHoursAgo(parseFloat(e.target.value))}
                  className="w-24 accent-sky-500"
                />
              </div>
            </div>

            {/* Weight Inputs with Direct Hardware Capture Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400">Gross (kg)</label>
                  {scale.isConnected && (
                    <button
                      type="button"
                      onClick={captureScaleGross}
                      className="text-[10px] text-sky-400 hover:underline font-mono"
                    >
                      [Capture]
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 mt-1"
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400">Tare Crate (kg)</label>
                  {scale.isConnected && (
                    <button
                      type="button"
                      onClick={captureScaleTare}
                      className="text-[10px] text-sky-400 hover:underline font-mono"
                    >
                      [Capture]
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 mt-1"
                />
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Brix Reading (°Bx)</label>
                <input
                  type="number"
                  step="0.1"
                  value={brix}
                  onChange={(e) => setBrix(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Floaters (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={floatersPct}
                  onChange={(e) => setFloatersPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Pricing Settlement Box */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Net Cherry Weight</span>
              <span className="font-mono text-slate-200 font-bold">{netWeight.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Grade A Bonus (Brix &gt;= 21)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {isGradeAPremium ? '+Rs 8.00 / kg' : 'Rs 0.00'}
              </span>
            </div>
            <div className="flex justify-between text-base text-slate-100 font-bold pt-2 border-t border-slate-700">
              <span>Farmer Settlement</span>
              <span className="font-mono text-sky-400">Rs {totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all"
          >
            Record Intake (Save Locally)
          </button>
        </form>

        {/* Local Journal */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Device Journal</h2>
            <span className="text-xs text-slate-500 font-mono">{records.length} transactions</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {records.map((r) => (
              <div key={r.localId} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{r.farmerName} — {r.plotRef}</div>
                  <div className="font-mono text-slate-500 text-[10px]">
                    {r.netWeightKg}kg · Rs {r.totalPayoutRs.toFixed(2)}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  r.syncStatus === 'SYNCED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {r.syncStatus}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
