'use client';
import React from 'react';

export const IntakeGateWidget: React.FC<{ todayKg?: number; gradeShareA?: number; gradeShareB?: number; criticalBatchesCount?: number }> = ({
  todayKg = 1310.4,
  gradeShareA = 88.5,
  gradeShareB = 11.5,
  criticalBatchesCount = 1,
}) => (
  <div className="glass-panel p-6 flex flex-col justify-between h-full">
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase text-neutral-400 font-semibold">Plant Gate Intake</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">FY 2083/84</span>
      </div>
      <div className="mt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tracking-tight font-sans">{todayKg.toLocaleString(undefined, { minimumFractionDigits: 1 })}</span>
          <span className="text-sm font-semibold text-neutral-400">NET KG</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Tare automatically deducted across 6 deliveries.</p>
      </div>
      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span>Grade A: {gradeShareA}%</span>
          <span className="text-neutral-400">Grade B: {gradeShareB}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 overflow-hidden flex">
          <div style={{ width: `${gradeShareA}%` }} className="bg-emerald-500 h-full" />
          <div style={{ width: `${gradeShareB}%` }} className="bg-amber-500 h-full" />
        </div>
      </div>
    </div>
    <div className="mt-6 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
        <span>⚠️ {criticalBatchesCount} lot within 1.5h of 8h pulping limit</span>
      </div>
      <span className="font-mono text-[10px] text-neutral-400">ENFORCED</span>
    </div>
  </div>
);
