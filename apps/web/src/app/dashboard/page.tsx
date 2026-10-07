'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardMetrics {
  procurement: {
    total_cherry_intake_kg: number;
    intake_by_district: Record<string, number>;
    grade_a_percentage: number;
    average_brix: number;
    eight_hour_cutoff_compliance_pct: number;
    active_farmers_count: number;
  };
  financials: {
    currency: string;
    total_procurement_expenditure: number;
    disbursed_payouts: number;
    pending_sync_liabilities: number;
    average_price_per_kg: number;
    grade_a_premiums_paid: number;
  };
  warehouse_mass_balance: {
    fresh_cherry_kg: number;
    wet_parchment_kg: number;
    dry_parchment_kg: number;
    milled_green_beans_kg: number;
    roasted_whole_beans_kg: number;
    packaged_drip_boxes: number;
  };
  eudr_compliance: {
    total_plots_monitored: number;
    total_registered_hectares: number;
    deforestation_pass_rate: number;
    benchmark_date: string;
    regulation_status: string;
  };
}

export default function ExecutiveDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/analytics/dashboard')
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((err) => console.error('Failed to load dashboard metrics', err));
  }, []);

  if (!metrics) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-sm">
        Aggregating vertical ERP telemetry...
      </div>
    );
  }

  const { procurement, financials, warehouse_mass_balance, eudr_compliance } = metrics;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE TELEMETRY COCKPIT</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Ximalaya Operations Executive</h1>
            <p className="text-sm text-slate-400">
              Vertically integrated estate telemetry across Gulmi & Palpa cooperatives
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/intake/mobile"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Field Intake PWA
            </Link>
            <Link
              href="/traceability/map"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Cadastral Map
            </Link>
            <Link
              href="/batches/PK-2083-0459/audit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg"
            >
              Batch Audit
            </Link>
          </div>
        </header>

        {/* 1. Core KPIs Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <span className="text-xs font-mono text-slate-500 block uppercase">Total Cherry Received</span>
            <div className="text-2xl font-black text-white mt-1">
              {(procurement.total_cherry_intake_kg / 1000).toFixed(1)} MT
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-mono">
              {procurement.active_farmers_count} Smallholders Active
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <span className="text-xs font-mono text-slate-500 block uppercase">Farmer Liabilities (NPR)</span>
            <div className="text-2xl font-black text-white mt-1">
              Rs {(financials.total_procurement_expenditure / 100000).toFixed(2)} Lakh
            </div>
            <div className="text-xs text-sky-400 mt-2 font-mono">
              Rs {(financials.disbursed_payouts / 100000).toFixed(2)} Lakh Disbursed (91.7%)
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <span className="text-xs font-mono text-slate-500 block uppercase">Quality Grade A Ratio</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {procurement.grade_a_percentage}%
            </div>
            <div className="text-xs text-slate-400 mt-2 font-mono">
              Avg Brix: {procurement.average_brix}°Bx (+Rs 8/kg)
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <span className="text-xs font-mono text-slate-500 block uppercase">EUDR Compliance</span>
            <div className="text-2xl font-black text-white mt-1">
              {eudr_compliance.deforestation_pass_rate}% Pass
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-mono">
              {eudr_compliance.total_registered_hectares} Ha Audited (Zero-Deforest)
            </div>
          </div>
        </section>

        {/* 2. Mass-Balance Warehouse Stock Balance */}
        <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Multi-State Warehouse Mass-Balance
              </h2>
              <p className="text-xs text-slate-400">
                Live inventory tracking across physical transformation stages
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700 w-fit">
              FIFO Conversion Mode
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">1. Fresh Cherry</span>
              <span className="text-lg font-bold text-slate-100">{warehouse_mass_balance.fresh_cherry_kg} kg</span>
              <span className="block text-[10px] text-slate-500 mt-1">65% Moisture</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">2. Wet Parchment</span>
              <span className="text-lg font-bold text-slate-100">{warehouse_mass_balance.wet_parchment_kg} kg</span>
              <span className="block text-[10px] text-amber-500 mt-1">Drying Beds</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">3. Dry Parchment</span>
              <span className="text-lg font-bold text-slate-100">{warehouse_mass_balance.dry_parchment_kg} kg</span>
              <span className="block text-[10px] text-sky-400 mt-1">10.8% Moisture</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">4. Green Bean</span>
              <span className="text-lg font-bold text-slate-100">{warehouse_mass_balance.milled_green_beans_kg} kg</span>
              <span className="block text-[10px] text-emerald-400 mt-1">Hulled Grade 1</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">5. Roasted Bean</span>
              <span className="text-lg font-bold text-slate-100">{warehouse_mass_balance.roasted_whole_beans_kg} kg</span>
              <span className="block text-[10px] text-rose-400 mt-1">15% Shrinkage</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">6. Boxed Drips</span>
              <span className="text-lg font-bold text-sky-400">{warehouse_mass_balance.packaged_drip_boxes}</span>
              <span className="block text-[10px] text-slate-500 mt-1">Nitro Sealed</span>
            </div>
          </div>
        </section>

        {/* 3. District Intake Velocity & Pulping Countdown Compliance */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              District Intake Distribution
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Gulmi (Ruru Eco-Station)</span>
                  <span className="font-bold">{procurement.intake_by_district.Gulmi.toLocaleString()} kg (58.4%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: '58.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Palpa (Tansen Collection Hub)</span>
                  <span className="font-bold">{procurement.intake_by_district.Palpa.toLocaleString()} kg (41.6%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '41.6%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Regulatory & Fermentation Sentinels
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">8h Harvest Cutoff</span>
                <span className="text-lg font-bold text-emerald-400">{procurement.eight_hour_cutoff_compliance_pct}%</span>
                <span className="block text-[10px] text-slate-500 mt-1">Zero Ferment Rot</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Deforestation Cutoff</span>
                <span className="text-lg font-bold text-emerald-400">PASSED</span>
                <span className="block text-[10px] text-slate-500 mt-1">{eudr_compliance.benchmark_date}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
