'use client';
import React from 'react';

export const SensoryLineageWidget: React.FC = () => {
  const scores = [
    { label: 'Fragrance', val: 8.75 },
    { label: 'Flavor', val: 8.50 },
    { label: 'Acidity', val: 8.50 },
    { label: 'Body', val: 8.25 },
    { label: 'Clean Cup', val: 10.0 },
  ];
  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">Quality Release & SCA Cupping</span>
            <h3 className="text-sm font-bold mt-0.5">R-2083-0212 • Gulmi Washed</h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">84.50</span>
            <div className="text-[10px] font-mono uppercase text-neutral-400">Specialty Single Origin</div>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          {scores.map((s) => (
            <div key={s.label} className="flex items-center gap-3 text-xs">
              <span className="w-20 font-medium text-neutral-500">{s.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800/60 overflow-hidden">
                <div style={{ width: `${(s.val / 10) * 100}%` }} className="h-full bg-emerald-500" />
              </div>
              <span className="font-mono text-xs w-8 text-right font-semibold">{s.val.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center text-xs">
        <span className="text-neutral-500">EUDR PostGIS Verified (1,450 MASL)</span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Ready for Pack</span>
      </div>
    </div>
  );
};
