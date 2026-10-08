'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface InventoryItem {
  sku: string;
  name: string;
  gtin: string;
  on_hand: number;
  allocated: number;
  available_to_promise: number;
  bin_location: string;
  cost_npr_per_unit: number;
  retail_npr_per_unit: number;
}

export default function WarehouseInventoryPage() {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [allocQty, setAllocQty] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStock = async () => {
    try {
      const res = await fetch('http://localhost:8000/logistics/inventory/SKU-DRIP-GUL-7X10G');
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAllocate = async () => {
    setIsLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('http://localhost:8000/logistics/inventory/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: 'SKU-DRIP-GUL-7X10G',
          quantity: allocQty
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Allocation failed');
      }
      setItem(data);
      setActionMsg({ type: 'success', text: `Successfully allocated ${allocQty} units to order reserve.` });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatch = async () => {
    setIsLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch('http://localhost:8000/logistics/inventory/deplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: 'SKU-DRIP-GUL-7X10G',
          quantity: allocQty
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Dispatch failed');
      }
      setItem(data);
      setActionMsg({ type: 'success', text: `Dispatched ${allocQty} units out of warehouse.` });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
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
            <Link href="/packaging" className="hover:text-amber-400">Packaging</Link>
            <span>/</span>
            <span className="text-amber-400">Finished Goods Warehouse</span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-300">
            EUDR Segregation Preserved
          </span>
        </div>

        {/* Header Bar */}
        <header className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Central Finished Goods Hub</h1>
            <p className="text-sm text-slate-400 mt-1">
              Kathmandu Distribution Center · Real-Time ATP & Order Allocation
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Active Warehouse</span>
              <span className="text-base font-bold text-white">KTM-WH1</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Stock Status</span>
              <span className="text-base font-bold text-emerald-400">Healthy</span>
            </div>
          </div>
        </header>

        {actionMsg && (
          <div className={`p-4 rounded-2xl border text-xs font-mono ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-700/80 text-rose-300'
          }`}>
            {actionMsg.type === 'success' ? '✓ ' : '⚠️ '}{actionMsg.text}
          </div>
        )}

        {/* Main Inventory Card */}
        {item && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold">{item.sku}</span>
                  <h2 className="text-lg font-bold text-white">{item.name}</h2>
                  <span className="text-xs font-mono text-slate-500">GTIN: {item.gtin} · Bin: {item.bin_location}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 block">Retail MSRP</span>
                  <span className="text-xl font-bold font-mono text-white">NPR {item.retail_npr_per_unit.toFixed(2)}</span>
                </div>
              </div>

              {/* Stock KPI Triplet */}
              <div className="grid grid-cols-3 gap-4 text-center font-mono">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Physical On-Hand</span>
                  <span className="text-3xl font-black text-slate-200">{item.on_hand}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Boxes</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Allocated / Held</span>
                  <span className="text-3xl font-black text-amber-400">{item.allocated}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Reserved</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Available to Promise</span>
                  <span className="text-3xl font-black text-emerald-400">{item.available_to_promise}</span>
                  <span className="text-[10px] text-emerald-500 block mt-1">Ready to Sell</span>
                </div>
              </div>

              {/* Valuation details */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex justify-between text-xs font-mono text-slate-400">
                <span>Unit Cost: <strong>NPR {item.cost_npr_per_unit.toFixed(2)}</strong></span>
                <span>Total On-Hand Inventory Valuation: <strong className="text-slate-200">NPR {(item.on_hand * item.cost_npr_per_unit).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Allocation & Dispatch Actions */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Inventory Operations</h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Batch Units for Operation</label>
                <input
                  type="number"
                  min="1"
                  value={allocQty}
                  onChange={(e) => setAllocQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAllocate}
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Reserve for Wholesale Order'}
                </button>

                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Confirm Dispatch & Deduct Stock'}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 font-mono leading-relaxed pt-2">
                * Reserving units reduces Available to Promise (ATP) while holding physical on-hand intact. Confirming dispatch decrements both.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
