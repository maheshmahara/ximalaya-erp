'use client';

import React, { useState, useMemo } from 'react';
import '@/styles/tokens.css';

export default function PackagingCostingDashboard() {
  const [unitsToPack, setUnitsToPack] = useState(100);
  const [skuType, setSkuType] = useState<'DRIP_BOX_7PCS' | 'WHOLE_BEAN_1KG'>('DRIP_BOX_7PCS');

  // Exact BOM component rates from Ximalaya Drip Costing Template
  const bomComponents = [
    { item: 'Filter Paper Bag (7 pcs @ Rs 30)', costPerBox: 210.0 },
    { item: 'Filter Sticker Print (7 pcs @ Rs 4)', costPerBox: 28.0 },
    { item: 'Die-line Box with Print (1 pc)', costPerBox: 18.0 },
    { item: 'Roasted Specialty Coffee (84g @ Rs 3/g)', costPerBox: 252.0 },
  ];

  const cpPerBox = 508.0;
  const cpPerBag = 72.57;

  // Real-time BOM aggregate calculations
  const totalCoffeeUsedKg = useMemo(() => {
    return Number(((unitsToPack * 84) / 1000).toFixed(2));
  }, [unitsToPack]);

  const totalRunCostNpr = useMemo(() => {
    return unitsToPack * cpPerBox;
  }, [unitsToPack]);

  // Channel price quotations (matching spreadsheet models)
  const channels = [
    { name: 'Wholesale / Distributor', margin: '20%', delivery: 20, mrp: 750, net: 663.72, profit: 135.72 },
    { name: 'Retail Supermarket', margin: '35%', delivery: 0, mrp: 890, net: 787.61, profit: 279.61 },
    { name: 'Online Marketplace', margin: '30%', delivery: 100, mrp: 1150, net: 1017.70, profit: 307.93 },
    { name: 'Corporate Gift Orders', margin: '25%', delivery: 50, mrp: 850, net: 752.21, profit: 194.21 },
  ];

  return (
    <div className="min-h-screen relative text-neutral-900 dark:text-neutral-100 p-6 md:p-10 font-sans">
      <div className="ambient-glow" />

      <main className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Processing Subsidiary • Finished Goods Floor
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">
              Packaging Run & BOM Costing
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Base Cost: Rs 508.00 / Box
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: BOM Configuration & Coffee Draw (5 cols) */}
          <div className="md:col-span-5 glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                Packaging Order Spec
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded font-bold bg-neutral-200/60 dark:bg-neutral-800/60">
                LOT: PK-2083-0458
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">SKU Format</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold font-mono">
                  <button
                    onClick={() => setSkuType('DRIP_BOX_7PCS')}
                    className={`py-2 px-3 rounded-xl border transition-all ${
                      skuType === 'DRIP_BOX_7PCS'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400'
                    }`}
                  >
                    Drip Box (7 pcs)
                  </button>
                  <button
                    onClick={() => setSkuType('WHOLE_BEAN_1KG')}
                    className={`py-2 px-3 rounded-xl border transition-all ${
                      skuType === 'WHOLE_BEAN_1KG'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-neutral-200/60 dark:border-neutral-800/60 text-neutral-400'
                    }`}
                  >
                    Whole Bean (1 kg)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">Units to Pack</label>
                <input
                  type="number"
                  value={unitsToPack}
                  onChange={(e) => setUnitsToPack(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-2xl font-black font-mono bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              {/* Bulk Roast Allocation */}
              <div className="p-3.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Bulk Roasted Coffee Required:</span>
                  <span className="font-mono font-bold">{totalCoffeeUsedKg} kg</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Total Landed Production Cost:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Rs {totalRunCostNpr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Itemized BOM Table */}
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold block mb-2">
                  Bill of Materials Breakdown
                </span>
                <div className="space-y-1.5 text-xs">
                  {bomComponents.map((b) => (
                    <div key={b.item} className="flex justify-between py-1 border-b border-neutral-200/30 dark:border-neutral-800/30">
                      <span className="text-neutral-500">{b.item}</span>
                      <span className="font-mono font-medium">Rs {b.costPerBox.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 font-bold">
                    <span>Landed Cost Price per Box</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">Rs {cpPerBox.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Effective Cost per Drip Bag</span>
                    <span className="font-mono">Rs {cpPerBag.toFixed(2)} / bag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Multi-Channel Sales Pricing & Margin Gates (7 cols) */}
          <div className="md:col-span-7 glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                  Channel Pricing Matrix & Margins
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  13% VAT Computed
                </span>
              </div>

              <div className="space-y-3 my-2">
                {channels.map((ch) => (
                  <div
                    key={ch.name}
                    className="p-3.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">{ch.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-neutral-200/60 dark:bg-neutral-800/60">
                        Target Margin: {ch.margin}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Final MRP</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          Rs {ch.mrp}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Net (ex-VAT)</span>
                        <span className="text-sm font-bold">Rs {ch.net.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Profit / Box</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          +Rs {ch.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert(`Issued GS1 Pack Lot PK-2083-0458 for ${unitsToPack} units. Stock booked to Finished Goods.`)}
              className="w-full py-3.5 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
            >
              Authorize Packaging Run & Print GS1 Serialization Tags
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
