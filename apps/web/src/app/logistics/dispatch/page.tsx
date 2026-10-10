'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface InventoryItem {
  sku: string;
  name: string;
  on_hand: number;
  allocated: number;
  available_to_promise: number;
  bin_location: string;
}

export default function ExportDispatchConsole() {
  const [sku] = useState('SKU-DRIP-GUL-7X10G');
  const [stock, setStock] = useState<InventoryItem | null>(null);

  // DDS form state
  const [refNumber, setRefNumber] = useState('DDS-2026-NPL-0042');
  const [importerEori, setImporterEori] = useState('DE987654321012345');
  const [exporterName, setExporterName] = useState('Ximalaya Specialty Coffee Producers Pvt Ltd');
  const [hsCode, setHsCode] = useState('0901.21');
  const [netMassKg, setNetMassKg] = useState<number>(7.0);
  const [selectedPlots, setSelectedPlots] = useState('PLOT-GUL-042, PLOT-GUL-043');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ddsResult, setDdsResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStock = async () => {
    try {
      const res = await fetch(`http://localhost:8000/logistics/inventory/${sku}`);
      if (res.ok) {
        const data = await res.json();
        setStock(data);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [sku]);

  const handleGenerateDDS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const plotList = selectedPlots.split(',').map((p) => p.trim()).filter(Boolean);

    try {
      const res = await fetch('http://localhost:8000/logistics/export/dds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_number: refNumber,
          importer_eori: importerEori,
          exporter_name: exporterName,
          hs_code: hsCode,
          net_mass_kg: Number(netMassKg),
          cadastral_plot_ids: plotList
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'DDS generation failed');
      }
      setDdsResult(data);
    } catch (err: any) {
      setErrorMsg(err.message);
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
            <Link href="/warehouse" className="hover:text-amber-400">Warehouse</Link>
            <span>/</span>
            <span className="text-amber-400">Export Dispatch & EUDR DDS</span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-950/80 border border-blue-700 text-blue-300">
            EU Regulation 2023/1115 (EUDR TRACES-NT)
          </span>
        </div>

        {/* Header Bar */}
        <header className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Export Freight & DDS Clearance</h1>
            <p className="text-sm text-slate-400 mt-1">
              Automated TRACES-NT Due Diligence Statement & Warehouse Manifest Generation
            </p>
          </div>

          <div className="flex gap-3 font-mono">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-right">
              <span className="text-slate-500 block text-[10px] uppercase">On Hand</span>
              <span className="text-xl font-bold text-white">{stock?.on_hand ?? '--'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-right">
              <span className="text-slate-500 block text-[10px] uppercase">Allocated</span>
              <span className="text-xl font-bold text-amber-400">{stock?.allocated ?? '--'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-right">
              <span className="text-emerald-400 block text-[10px] uppercase">ATP Stock</span>
              <span className="text-xl font-black text-emerald-300">{stock?.available_to_promise ?? '--'}</span>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-700/80 text-rose-300 text-xs font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DDS Form */}
          <form onSubmit={handleGenerateDDS} className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              TRACES-NT Due Diligence Statement Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">DDS Reference (DDS-YYYY-XXXX)</label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">EU Importer EORI Number</label>
                <input
                  type="text"
                  value={importerEori}
                  onChange={(e) => setImporterEori(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Harmonized HS Code</label>
                <select
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                >
                  <option value="0901.21">0901.21 (Roasted Not Decaf)</option>
                  <option value="0901.11">0901.11 (Green Not Decaf)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Net Export Mass (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={netMassKg}
                  onChange={(e) => setNetMassKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Origin Warehouse Bin</label>
                <input
                  type="text"
                  value={stock?.bin_location || 'BIN-KTM-WH1-R04'}
                  disabled
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Associated Cadastral Plot IDs (Comma Separated)</label>
              <input
                type="text"
                value={selectedPlots}
                onChange={(e) => setSelectedPlots(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-xl mt-4"
            >
              {isSubmitting ? 'Validating Polygon Geometries...' : 'Emit EUDR TRACES-NT Statement'}
            </button>
          </form>

          {/* Manifest Actions & Results */}
          <div className="space-y-6">
            {/* PDF Dispatch Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Carrier Manifest PDF</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate the official warehouse dispatch manifest signed by the logistics supervisor and carrier driver.
              </p>
              <a
                href="http://localhost:8000/logistics/dispatch/DSP-2083-0042/manifest.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Download Manifest PDF ↗
              </a>
            </div>

            {/* DDS Result Card */}
            {ddsResult && (
              <div className="p-5 rounded-3xl bg-blue-950/60 border border-blue-700/80 space-y-3">
                <span className="text-xs font-mono font-bold text-blue-400 block">
                  ✓ EUDR DUE DILIGENCE STATEMENT VERIFIED
                </span>
                <p className="text-xs text-blue-200 font-mono">
                  Ref: <strong className="text-white">{ddsResult.dds_reference}</strong>
                </p>
                <div className="text-[11px] font-mono text-slate-300 space-y-1">
                  <div>Parcels Cleared: {ddsResult.geolocation_parcels.length} Polygons</div>
                  <div>Segregation: {ddsResult.commodity.segregation_model}</div>
                  <div>Status: <span className="text-emerald-400 font-bold">{ddsResult.verification_status}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
