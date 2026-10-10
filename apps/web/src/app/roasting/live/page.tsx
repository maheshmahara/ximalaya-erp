'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface TelemetryTick {
  source: string;
  batch_id: string;
  elapsed_seconds: number;
  phase: string;
  bean_temp_c: number;
  env_temp_c: number;
  rate_of_rise: number;
  heater_duty_pct: number;
  fan_pct: number;
  artisan_event?: string | null;
}

export default function RoastingLiveCockpit() {
  const [data, setData] = useState<TelemetryTick>({
    source: 'ESP32_ARTISAN',
    batch_id: 'BATCH-ESP32-001',
    elapsed_seconds: 0,
    phase: 'DRYING',
    bean_temp_c: 195.0,
    env_temp_c: 211.0,
    rate_of_rise: 0.0,
    heater_duty_pct: 100.0,
    fan_pct: 50.0,
    artisan_event: null
  });

  const [history, setHistory] = useState<{ time: number; bt: number; et: number; ror: number }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Settlement Modal State
  const [showModal, setShowModal] = useState(false);
  const [greenWeight, setGreenWeight] = useState<number>(10.0);
  const [roastedWeight, setRoastedWeight] = useState<number>(8.5);
  const [profileName, setProfileName] = useState('Nordic Light #45');
  const [settlementResult, setSettlementResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isUnmounted = false;

    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:8000/roasting/ws/BATCH-ESP32-001');

      ws.onopen = () => {
        if (!isUnmounted) setIsConnected(true);
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onerror = () => {
        if (!isUnmounted) setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const tick: TelemetryTick = JSON.parse(event.data);
          setData(tick);
          setHistory((prev) => [
            ...prev.slice(-35),
            {
              time: tick.elapsed_seconds,
              bt: tick.bean_temp_c,
              et: tick.env_temp_c,
              ror: tick.rate_of_rise
            }
          ]);
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws) ws.close();
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculatedShrinkage = greenWeight > 0 && roastedWeight <= greenWeight
    ? Number((((greenWeight - roastedWeight) / greenWeight) * 100).toFixed(2))
    : 0;

  const handleSettleBatch = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/roasting/drop-settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: data.batch_id,
          green_charge_weight_kg: Number(greenWeight),
          roasted_drop_weight_kg: Number(roastedWeight),
          roast_profile_name: profileName,
          roaster_model: 'Electric Drum (ESP32 / Artisan)'
        })
      });
      const resData = await res.json();
      setSettlementResult(resData);
    } catch (err) {
      console.error('Settlement error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Live Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Link href="/dashboard" className="hover:text-amber-400">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Roasting</span>
            <span>/</span>
            <span className="text-amber-400">ESP32 Electric Live Stream</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg flex items-center gap-1.5"
            >
              <span>Drop & Settle Batch</span>
            </button>
            <div className="flex items-center space-x-2 pl-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-mono font-bold text-slate-300">
                {isConnected ? 'ESP32 / Artisan Online' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Bar */}
        <header className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">Electric Roaster Telemetry</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/80 border border-amber-700 text-amber-300">
                {data.phase}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Active Batch: <strong className="text-slate-200 font-mono">{data.batch_id}</strong> · Artisan Bridge Forwarder
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Timer</span>
              <span className="text-xl font-bold text-slate-100">{formatTime(data.elapsed_seconds)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">SSR Power</span>
              <span className="text-xl font-bold text-amber-400">{data.heater_duty_pct}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Exhaust Fan</span>
              <span className="text-xl font-bold text-sky-400">{data.fan_pct}%</span>
            </div>
          </div>
        </header>

        {/* Live Gauges Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Bean Temp (BT)</span>
            <span className="text-5xl font-black text-amber-400 font-mono tracking-tight">{data.bean_temp_c}°C</span>
            <span className="text-xs text-slate-500 mt-2 font-mono">Thermocouple Probe 1</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Env / Exhaust Temp (ET)</span>
            <span className="text-5xl font-black text-rose-400 font-mono tracking-tight">{data.env_temp_c}°C</span>
            <span className="text-xs text-slate-500 mt-2 font-mono">Thermocouple Probe 2</span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Rate of Rise (RoR)</span>
            <span className="text-5xl font-black text-emerald-400 font-mono tracking-tight">{data.rate_of_rise}</span>
            <span className="text-xs text-slate-500 mt-2 font-mono">°C / min (Differential)</span>
          </div>
        </div>

        {/* Real-time Profile Canvas */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Temperature Trajectory</h2>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> BT</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> ET</span>
            </div>
          </div>

          <div className="h-64 w-full flex items-end gap-1.5 p-4 bg-slate-950/60 rounded-2xl border border-slate-900 overflow-x-auto">
            {history.map((pt, idx) => {
              const btHeight = Math.min(100, Math.max(10, ((pt.bt - 80) / 140) * 100));
              const etHeight = Math.min(100, Math.max(10, ((pt.et - 80) / 140) * 100));

              return (
                <div key={idx} className="flex-1 flex items-end justify-center gap-0.5 min-w-[12px] h-full group relative">
                  <div
                    style={{ height: `${btHeight}%` }}
                    className="w-1.5 bg-amber-500/80 rounded-t transition-all duration-300"
                  />
                  <div
                    style={{ height: `${etHeight}%` }}
                    className="w-1.5 bg-rose-500/70 rounded-t transition-all duration-300"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop Settlement Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Drop Batch & Settle Corridor</h3>
                  <p className="text-xs text-slate-400">Batch: {data.batch_id}</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSettlementResult(null); }}
                  className="text-slate-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {!settlementResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Green Charge (kg)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={greenWeight}
                        onChange={(e) => setGreenWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Roasted Drop (kg)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={roastedWeight}
                        onChange={(e) => setRoastedWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Profile Preset</label>
                    <select
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    >
                      <option value="Nordic Light #45">Nordic Light Roast #45 (14.0% - 15.5%)</option>
                      <option value="Omniroast Filter & Espresso">Omniroast Filter & Espresso (15.5% - 16.5%)</option>
                      <option value="Full Medium">Full Medium #35 (16.0% - 17.0%)</option>
                    </select>
                  </div>

                  {/* Calculated Shrinkage Preview */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Shrinkage Loss:</span>
                    <span className={`text-base font-bold ${
                      calculatedShrinkage >= 13.5 && calculatedShrinkage <= 17.0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}>
                      {calculatedShrinkage}%
                    </span>
                  </div>

                  <button
                    onClick={handleSettleBatch}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Logging Settlement...' : 'Confirm Drop & Post to Ledger'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-700/60 text-center space-y-2">
                    <span className="text-xs font-mono text-emerald-400 block font-bold">
                      ✓ BATCH SETTLED SUCCESSFULLY
                    </span>
                    <div className="text-2xl font-black font-mono text-white">
                      {settlementResult.shrinkage_pct}% Shrinkage
                    </div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-900 border border-emerald-600 text-emerald-200">
                      {settlementResult.corridor_status}
                    </span>
                  </div>

                  <button
                    onClick={() => { setShowModal(false); setSettlementResult(null); }}
                    className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
