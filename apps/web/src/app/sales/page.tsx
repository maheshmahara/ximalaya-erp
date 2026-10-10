'use client';

import React, { useState, useMemo } from 'react';
import '@/styles/tokens.css';

export default function CommercialBillingDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState<'RHODO' | 'HIMALAYAN' | 'HIMAL_OVERDUE'>('RHODO');
  const [boxQuantity, setBoxQuantity] = useState(150);
  const [unitRateExVat, setUnitRateExVat] = useState(663.72); // Wholesale base net price

  const customerProfiles = {
    RHODO: {
      name: 'Rhododendron Specialty Cafe',
      pan: '608927164',
      type: 'Specialty Cafe (B2B)',
      creditTerms: '30 Days',
      creditLimit: 250000,
      outstanding: 45200,
      overdueDays: 12,
      isHeld: false,
    },
    HIMALAYAN: {
      name: 'Himalayan Luxury Boutique Hotel',
      pan: '609182736',
      type: 'HORECA',
      creditTerms: '15 Days',
      creditLimit: 500000,
      outstanding: 112000,
      overdueDays: 0,
      isHeld: false,
    },
    HIMAL_OVERDUE: {
      name: 'Lalitpur Gourmet Roastery Partner',
      pan: '601928374',
      type: 'Distributor',
      creditTerms: '15 Days',
      creditLimit: 150000,
      outstanding: 99440,
      overdueDays: 34,
      isHeld: true,
    },
  };

  const activeClient = customerProfiles[selectedCustomer];

  const { subtotal, vatAmount, grandTotal } = useMemo(() => {
    const sub = Number((boxQuantity * unitRateExVat).toFixed(2));
    const vat = Number((sub * 0.13).toFixed(2));
    return {
      subtotal: sub,
      vatAmount: vat,
      grandTotal: Number((sub + vat).toFixed(2)),
    };
  }, [boxQuantity, unitRateExVat]);

  return (
    <div className="min-h-screen relative text-neutral-900 dark:text-neutral-100 p-6 md:p-10 font-sans">
      <div className="ambient-glow" />

      <main className="max-w-6xl mx-auto space-y-6 relative z-10">
        <header className="flex justify-between items-center pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Commercial Subsidiary • Billing & Compliance
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">
              Gapless IRD Fiscal Invoicing
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              13% VAT Electronic Sync Active
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-neutral-400">
                Customer Account Context
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  activeClient.isHeld
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {activeClient.isHeld ? 'CREDIT HOLD ACTIVE' : 'CREDIT APPROVED'}
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-400 block mb-1">Select Account</label>
              <div className="space-y-1.5">
                {(['RHODO', 'HIMALAYAN', 'HIMAL_OVERDUE'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCustomer(key)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedCustomer === key
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-neutral-200/60 dark:border-neutral-800/60'
                    }`}
                  >
                    <div className="font-bold">{customerProfiles[key].name}</div>
                    <div className="text-[11px] text-neutral-500">
                      {customerProfiles[key].type} • PAN: {customerProfiles[key].pan}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Credit Limit:</span>
                <span className="font-mono font-bold">Rs {activeClient.creditLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Outstanding:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  Rs {activeClient.outstanding.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Max Overdue Aging:</span>
                <span
                  className={`font-mono font-bold ${
                    activeClient.overdueDays > 30 ? 'text-red-500' : 'text-neutral-500'
                  }`}
                >
                  {activeClient.overdueDays} Days {activeClient.overdueDays > 30 ? '(>30d Cutoff Breached)' : ''}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200/40 dark:border-neutral-800/40">
              Governance Policy: Orders and dispatches are halted automatically whenever overdue receivables cross 30 days.
            </p>
          </div>

          <div className="md:col-span-7 glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-neutral-400 block">
                    Electronic Invoicing Spec
                  </span>
                  <h3 className="text-lg font-bold">INV-2083/84-00419</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-500 font-bold">
                    Fiscal Date: 2083/07/04
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <label className="text-xs text-neutral-400 block mb-1">Drip Coffee Boxes (7 pcs)</label>
                  <input
                    type="number"
                    value={boxQuantity}
                    onChange={(e) => setBoxQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xl font-black font-mono bg-transparent focus:outline-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50">
                  <label className="text-xs text-neutral-400 block mb-1">Unit Rate ex-VAT (NPR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitRateExVat}
                    onChange={(e) => setUnitRateExVat(parseFloat(e.target.value) || 0)}
                    className="w-full text-xl font-black font-mono bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/50 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal Taxable Amount:</span>
                  <span className="font-bold">Rs {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Nepal Value Added Tax (13%):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +Rs {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200/40 dark:border-neutral-800/40 text-sm font-black">
                  <span>Grand Total (incl. 13% VAT):</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">
                    Rs {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800/60 flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-400">IRD Fiscal Auth Token:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  IRD-4F9A2B78C1E03D
                </span>
              </div>
            </div>

            <button
              disabled={activeClient.isHeld}
              onClick={() => alert(`Generated fiscal invoice INV-2083/84-00419 for Rs ${grandTotal.toLocaleString()} with electronic IRD verification.`)}
              className="w-full py-3.5 mt-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all disabled:opacity-40"
            >
              {activeClient.isHeld
                ? 'Fulfillment Blocked: Credit Hold Active'
                : `Commit Fiscal Invoice • Rs ${grandTotal.toLocaleString()}`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
