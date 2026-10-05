'use client';
import React from 'react';

const activeTanks = [
  { tankId: 'TANK-01', batchCode: 'FB-2083-033', method: 'Washed', currentPh: 4.62, tempCelsius: 21.8, hoursElapsed: 14, isReady: false },
  { tankId: 'TANK-02', batchCode: 'FB-2083-031', method: 'Washed', currentPh: 4.05, tempCelsius: 22.4, hoursElapsed: 26, isReady: true },
  { tankId: 'TANK-03', batchCode: 'FB-2083-032', method: 'Anaerobic', currentPh: 3.92, tempCelsius: 19.5, hoursElapsed: 48, isReady: false },
];

export const FermentationTelemetryWidget: React.FC = () => (
  <div className="glass-panel p-6 flex flex-col justify-between h-full">
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">Fermentation Bioprocess</span>
          <h3 className="text-sm font-bold mt-0.5">Biochemical pH Corridors</h3>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-500 font-semibold">Target: 3.80 – 4.20 pH</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-2">
        {activeTanks.map((tank) => (
          <div key={tank.tankId} className={`p-3.5 rounded-xl border ${tank.isReady ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/40 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60'}`}>
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold">{tank.tankId}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-neutral-200/60 dark:bg-neutral-800/60">{tank.method}</span>
            </div>
            <div className="my-2.5">
              <div className="text-2xl font-black font-mono">pH {tank.currentPh.toFixed(2)}</div>
              <div className="text-[11px] text-neutral-500">{tank.batchCode}</div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-neutral-200/40 dark:border-neutral-800/40">
              <span>{tank.tempCelsius}°C</span>
              <span>{tank.hoursElapsed}h in tank</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-4 pt-3 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center text-xs text-neutral-500">
      <span>Tactile squeak confirmation active</span>
      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Corridor Monitored</span>
    </div>
  </div>
);
