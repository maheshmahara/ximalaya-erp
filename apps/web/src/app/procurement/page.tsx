'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface M1Reading {
  moisture: number;
  density: number;
}

export default function AdvancedProcurementPage() {
  const { token, openLoginModal } = useAuth();

  // 1. Supplier Configuration
  const [supplierType, setSupplierType] = useState('SAHAKARI');
  const [supplierName, setSupplierName] = useState('Ruru Coffee Sahakari Ltd.');
  const [supplierContact, setSupplierContact] = useState('9847012345');
  const [plotCode, setPlotCode] = useState('PLOT-GUL-042');
  const [district, setDistrict] = useState('Gulmi');

  // 2. Product Form
  const [productForm, setProductForm] = useState('RED_CHERRY');

  // 3. Weight
  const [grossWeight, setGrossWeight] = useState<number>(1200);
  const [tareWeight, setTareWeight] = useState<number>(15);
  const [bagCount, setBagCount] = useState<number>(24);
  const [baseRate, setBaseRate] = useState<number>(125);

  // 4. M1 Caffe Meter Sensor Readings (Strictly >= 5 entries)
  const [m1Readings, setM1Readings] = useState<M1Reading[]>([
    { moisture: 64.2, density: 710 },
    { moisture: 65.0, density: 715 },
    { moisture: 64.8, density: 708 },
    { moisture: 65.4, density: 712 },
    { moisture: 64.6, density: 714 },
  ]);

  // 5. Transport & Pickup Traceability
  const [vehicleOwnership, setVehicleOwnership] = useState('COMPANY_OWN');
  const [driverName, setDriverName] = useState('Gopal Shrestha');
  const [driverPhone, setDriverPhone] = useState('9812345678');
  const [vehiclePlate, setVehiclePlate] = useState('Lu 2 Kha 4821');
  const [pickupLocation, setPickupLocation] = useState('Ruru Collection Center, Ward 4');
  const [pickupLat, setPickupLat] = useState<number>(27.987654);
  const [pickupLng, setPickupLng] = useState<number>(83.432612);
  const [sealNumber, setSealNumber] = useState('SEAL-XCC-9081');
  const [destinationStore, setDestinationStore] = useState('CENTRAL-SILO-WH1');

  // Response & Status
  const [loading, setLoading] = useState(false);
  const [manifestResult, setManifestResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // M1 Sensor Calculations
  const m1Stats = useMemo(() => {
    if (m1Readings.length === 0) return { avgM: 0, avgD: 0, count: 0 };
    const avgM = m1Readings.reduce((acc, cur) => acc + cur.moisture, 0) / m1Readings.length;
    const avgD = m1Readings.reduce((acc, cur) => acc + cur.density, 0) / m1Readings.length;
    return {
      avgM: parseFloat(avgM.toFixed(2)),
      avgD: parseFloat(avgD.toFixed(1)),
      count: m1Readings.length,
    };
  }, [m1Readings]);

  const netWeight = Math.max(0, grossWeight - tareWeight);
  const totalPayout = (netWeight * baseRate).toFixed(2);

  const handleUpdateM1 = (index: number, field: 'moisture' | 'density', value: number) => {
    const updated = [...m1Readings];
    updated[index] = { ...updated[index], [field]: value };
    setM1Readings(updated);
  };

  const handleAddReading = () => {
    const last = m1Readings[m1Readings.length - 1] || { moisture: 65.0, density: 710 };
    setM1Readings([...m1Readings, { moisture: last.moisture, density: last.density }]);
  };

  const handleRemoveReading = (index: number) => {
    if (m1Readings.length <= 5) {
      alert('EUDR & SCA Quality Control require a minimum of 5 M1 Caffe Meter physical readings.');
      return;
    }
    setM1Readings(m1Readings.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      openLoginModal();
      return;
    }

    if (m1Readings.length < 5) {
      setError('Minimum 5 readings are required from the M1 Caffe Meter.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier_type: supplierType,
        supplier_name: supplierName,
        supplier_contact: supplierContact,
        cadastral_plot_code: plotCode,
        district: district,
        cooperative_sahakari_id: supplierType === 'SAHAKARI' ? 'SAHAKARI-RURU-01' : null,
        product_form: productForm,
        gross_weight_kg: Number(grossWeight),
        tare_weight_kg: Number(tareWeight),
        bag_count: Number(bagCount),
        m1_readings: m1Readings.map((r, i) => ({
          reading_index: i + 1,
          moisture_pct: Number(r.moisture),
          density_g_l: Number(r.density),
        })),
        base_rate_npr_per_kg: Number(baseRate),
        transport: {
          ownership_type: vehicleOwnership,
          driver_name: driverName,
          driver_phone: driverPhone,
          vehicle_registration: vehiclePlate,
          pickup_location_name: pickupLocation,
          pickup_gps_lat: Number(pickupLat),
          pickup_gps_lng: Number(pickupLng),
          seal_number: sealNumber,
          destination_store_code: destinationStore,
        },
      };

      const res = await fetch('/api/procurement/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned ${res.status}`);
      }

      const data = await res.json();
      setManifestResult(data);
    } catch (err: any) {
      setError(err.message || 'Procurement transmission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Module Header */}
        <div className="border border-neutral-800 rounded-3xl bg-neutral-900/60 backdrop-blur p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                INBOUND ERP
              </span>
              <span className="text-xs text-neutral-400">Multi-Channel Procurement & Logistics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Procurement & Transport Traceability Gateway
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Captures cherry/parchment intake, enforces 5-point M1 Caffe Meter density/moisture readings, and tracks fleet pickup to store.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/traceability/map"
              className="rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-200 border border-neutral-700 transition"
            >
              🛰️ Cadastral Map
            </Link>
            <Link
              href="/batches/PK-2083-0459/audit"
              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition shadow"
            >
              📊 Mass Balance Ledger
            </Link>
          </div>
        </div>

        {/* Farmer-to-Store Traceability Pipeline Visualizer */}
        <div className="border border-neutral-800 rounded-3xl bg-neutral-900/40 p-6 shadow-2xl">
          <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest block mb-4">
            Physical Chain-of-Custody Stream (Farm Gate ➔ Warehouse Store)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
            
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-amber-500 text-[10px] uppercase font-bold block">1. Origin Source</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{supplierType.replace('_', ' ')}</span>
                <span className="text-neutral-400 text-[11px] block">{supplierName}</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-2">EUDR Plot: {plotCode}</span>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-sky-400 text-[10px] uppercase font-bold block">2. Commodity Form</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{productForm.replace('_', ' ')}</span>
                <span className="text-neutral-400 text-[11px] block">{netWeight} kg ({bagCount} Bags)</span>
              </div>
              <span className="text-[10px] text-neutral-400 mt-2">Tare: {tareWeight} kg</span>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-purple-400 text-[10px] uppercase font-bold block">3. M1 Caffe Meter</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{m1Stats.avgM}% Moisture</span>
                <span className="text-neutral-400 text-[11px] block">{m1Stats.avgD} g/L Density</span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-2">✓ {m1Stats.count}-Point Validated</span>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-orange-400 text-[10px] uppercase font-bold block">4. Transport Pickup</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{vehicleOwnership.replace('_', ' ')}</span>
                <span className="text-neutral-400 text-[11px] block">{driverName} ({vehiclePlate})</span>
              </div>
              <span className="text-[10px] text-sky-400 mt-2">GPS Logged</span>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
              <div>
                <span className="text-emerald-400 text-[10px] uppercase font-bold block">5. Store Ingestion</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{destinationStore}</span>
                <span className="text-neutral-400 text-[11px] block">Seal: {sealNumber}</span>
              </div>
              <span className="text-[10px] text-amber-400 mt-2">NPR {Number(totalPayout).toLocaleString()}</span>
            </div>

          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-950/60 border border-rose-800 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Input Workstation */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">

            {/* SECTION 1: Supplier Typology & Product Form */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🌱</span> Supplier & Product Classification
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                    Supplier Typology
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-medium">
                    {[
                      { id: 'OWN_PLANTATION', label: 'Own Plantation' },
                      { id: 'FARMER', label: 'Farmer' },
                      { id: 'VILLAGE_COLLECTOR', label: 'Village Collector' },
                      { id: 'SAHAKARI', label: 'Sahakari' },
                      { id: 'OTHER_SUPPLIERS', label: 'Other Suppliers' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSupplierType(s.id)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          supplierType === s.id
                            ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Supplier / Entity Name</label>
                    <input
                      type="text"
                      required
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={supplierContact}
                      onChange={(e) => setSupplierContact(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Cadastral Plot (PostGIS)</label>
                    <input
                      type="text"
                      value={plotCode}
                      onChange={(e) => setPlotCode(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                    Procurement Commodity Form
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-medium">
                    {[
                      { id: 'RED_CHERRY', label: '🍒 Red Cherry' },
                      { id: 'DRY_CHERRY', label: '☀️ Dry Cherry' },
                      { id: 'PARCHMENT', label: '📜 Parchment' },
                      { id: 'GREEN_BEAN', label: '🫘 Green Bean' },
                      { id: 'ROASTED_BEAN', label: '☕ Roasted Bean' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProductForm(p.id)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          productForm === p.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Weight & Physical Scale */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>⚖️</span> Physical Scale Measurements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Gross Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Tare Deduction (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Bag Count</label>
                  <input
                    type="number"
                    required
                    value={bagCount}
                    onChange={(e) => setBagCount(Number(e.target.value))}
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Base Price (NPR/kg)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: M1 Caffe Meter Sensor Ingestion (Min 5 readings) */}
            <div className="rounded-3xl border border-purple-900/50 bg-neutral-900/50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">🔬 M1 Caffe Meter Integration</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/60 border border-purple-700 text-purple-300">
                      MIN 5 READINGS ENFORCED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Moisture (%) and bulk density (g/L) logged from physical M1 sensor probe before store intake.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddReading}
                  className="rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 transition"
                >
                  + Add Point
                </button>
              </div>

              <div className="space-y-2">
                {m1Readings.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-800/40 border border-neutral-800"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-600 text-purple-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-mono">Moisture (%)</span>
                        <input
                          type="number"
                          step="0.1"
                          value={r.moisture}
                          onChange={(e) => handleUpdateM1(idx, 'moisture', Number(e.target.value))}
                          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-mono">Density (g/L)</span>
                        <input
                          type="number"
                          step="1"
                          value={r.density}
                          onChange={(e) => handleUpdateM1(idx, 'density', Number(e.target.value))}
                          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    </div>

                    {m1Readings.length > 5 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveReading(idx)}
                        className="text-neutral-500 hover:text-rose-400 px-2 transition text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* M1 Meter Live Calculation Summary */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/50 flex flex-wrap items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block">Arithmetic Mean Moisture:</span>
                  <span className="text-base font-bold text-purple-300">{m1Stats.avgM}%</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Arithmetic Mean Density:</span>
                  <span className="text-base font-bold text-purple-300">{m1Stats.avgD} g/L</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Sensor Sample Count:</span>
                  <span className="text-base font-bold text-emerald-400">{m1Stats.count} / 5 Min</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: Inbound Logistics & Driver Traceability */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🚚</span> Transport & Pickup Fleet Traceability
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                    Vehicle Used Type
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                    {[
                      { id: 'COMPANY_OWN', label: 'Company Own' },
                      { id: 'RENTING', label: 'Renting' },
                      { id: 'FARMER_SELF', label: 'Farmer Self' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleOwnership(v.id)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          vehicleOwnership === v.id
                            ? 'border-orange-500 bg-orange-500/10 text-orange-300 font-bold'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Driver Name</label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Driver Phone</label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Vehicle Plate No.</label>
                    <input
                      type="text"
                      required
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Pickup GPS (Lat / Lng)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={pickupLat}
                        onChange={(e) => setPickupLat(Number(e.target.value))}
                        className="w-1/2 rounded-xl bg-neutral-800 border border-neutral-700 px-2.5 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={pickupLng}
                        onChange={(e) => setPickupLng(Number(e.target.value))}
                        className="w-1/2 rounded-xl bg-neutral-800 border border-neutral-700 px-2.5 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Security Seal Tag</label>
                    <input
                      type="text"
                      value={sealNumber}
                      onChange={(e) => setSealNumber(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Destination Silo / Store</label>
                    <input
                      type="text"
                      value={destinationStore}
                      onChange={(e) => setDestinationStore(e.target.value)}
                      className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-amber-600 hover:bg-amber-500 py-4 text-sm font-bold text-white transition shadow-xl shadow-amber-600/30 disabled:opacity-50"
            >
              {loading ? 'Transmitting Inbound Waybill...' : 'Record Intake & Dispatch Vehicle to Store'}
            </button>

          </div>

          {/* Right Summary & Digital Waybill Output */}
          <div className="space-y-6">
            
            {/* Real-time Settlement Summary */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur p-6 space-y-4 shadow-xl">
              <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest block">
                Settlement & Sensor Gate
              </span>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Supplier:</span>
                  <span className="text-white font-bold">{supplierType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Commodity:</span>
                  <span className="text-emerald-400 font-bold">{productForm}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Net Weight:</span>
                  <span className="text-white font-bold">{netWeight} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-purple-300">Avg M1 Moisture:</span>
                  <span className="text-purple-300 font-bold">{m1Stats.avgM}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-purple-300">Avg M1 Density:</span>
                  <span className="text-purple-300 font-bold">{m1Stats.avgD} g/L</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Transport:</span>
                  <span className="text-orange-400 font-bold">{vehicleOwnership}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                  Total Supplier Payout Due
                </span>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  NPR {Number(totalPayout).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Inbound Waybill / Manifest Result */}
            {manifestResult && (
              <div className="rounded-3xl border border-emerald-800/80 bg-emerald-950/30 p-6 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Waybill Generated
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700 text-emerald-200">
                    {manifestResult.waybill_number}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-300 font-mono">
                  <p><strong>Order ID:</strong> <span className="text-amber-400">{manifestResult.order_id}</span></p>
                  <p><strong>Vehicle:</strong> {manifestResult.transport_traceability.vehicle_plate} ({manifestResult.transport_traceability.driver_name})</p>
                  <p><strong>Store Destination:</strong> {manifestResult.transport_traceability.destination_store}</p>
                  <p><strong>M1 Status:</strong> <span className="text-purple-300">{manifestResult.m1_caffe_meter_audit.quality_flag} ({manifestResult.m1_caffe_meter_audit.average_moisture_pct}%)</span></p>
                  <p><strong>Status:</strong> <span className="text-emerald-400 font-bold">{manifestResult.transport_traceability.status}</span></p>
                </div>

                <Link
                  href="/traceability/map"
                  className="mt-3 block text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition shadow"
                >
                  View Cadastral Polygon & Fleet Map →
                </Link>
              </div>
            )}

          </div>

        </form>

      </div>
    </div>
  );
}
