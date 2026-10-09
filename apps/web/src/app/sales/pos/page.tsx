'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface InventoryItem {
  sku: string;
  name: string;
  on_hand: number;
  available_to_promise: number;
  retail_npr_per_unit: number;
}

export default function WholesaleBillingPOS() {
  const [buyerName, setBuyerName] = useState('Himalayan Java Pvt Ltd');
  const [buyerPan, setBuyerPan] = useState('601928374');
  const [sku, setSku] = useState('SKU-DRIP-GUL-7X10G');
  const [quantity, setQuantity] = useState<number>(20);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(1250.0);

  const [stockItem, setStockItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStock = async () => {
    try {
      const res = await fetch(`http://localhost:8000/logistics/inventory/${sku}`);
      if (res.ok) {
        const data = await res.json();
        setStockItem(data);
        setUnitPrice(data.retail_npr_per_unit);
      }
    } catch (err) {
      console.error('Failed to fetch stock:', err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [sku]);

  const subtotal = Number((quantity * unitPrice).toFixed(2));
  const taxable = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  const vat = Number((taxable * 0.13).toFixed(2));
  const grandTotal = Number((taxable + vat).toFixed(2));

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('http://localhost:8000/sales/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_name: buyerName,
          buyer_pan: buyerPan,
          items: [
            {
              sku,
              description: stockItem?.name || 'Single-Serve Drip Box (7x10g)',
              quantity: Number(quantity),
              unit_price: Number(unitPrice),
              is_tax_exempt: false
            }
          ],
          discount_amount: Number(discountAmount),
          deduct_warehouse_stock: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invoice issuance failed');
      }
      setGeneratedInvoice(data);
      fetchStock();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Link href="/dashboard" className="hover:text-amber-400">Dashboard</Link>
            <span>/</span>
            <Link href="/warehouse" className="hover:text-amber-400">Warehouse</Link>
            <span>/</span>
            <span className="text-amber-400">Nepal Fiscal Invoicing & POS</span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 border border-amber-700 text-amber-300">
            Nepal IRD CBMS Compliant (13% VAT)
          </span>
        </div>

        <header className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Wholesale Fiscal Dispatch</h1>
            <p className="text-sm text-slate-400 mt-1">
              Issue Official IRD Nepal Tax Invoices with Automatic Inventory Depletion
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-right font-mono">
            <span className="text-slate-500 block text-[10px] uppercase">Warehouse Stock (ATP)</span>
            <span className="text-2xl font-black text-emerald-400">{stockItem?.available_to_promise ?? '--'} Boxes</span>
          </div>
        </header>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-700/80 text-rose-300 text-xs font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleIssueInvoice} className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Buyer & Item Specifics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Buyer Entity Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Buyer PAN Number (9 Digits)</label>
                <input
                  type="text"
                  value={buyerPan}
                  onChange={(e) => setBuyerPan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Select SKU</label>
                <select
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                >
                  <option value="SKU-DRIP-GUL-7X10G">SKU-DRIP-GUL-7X10G</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Order Quantity (Boxes)</label>
                <input
                  type="number"
                  min="1"
                  max={stockItem?.available_to_promise || 1000}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Unit Price (NPR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Trade Discount (NPR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !stockItem || quantity > stockItem.available_to_promise}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-xl mt-4"
            >
              {isSubmitting ? 'Issuing Fiscal Invoice...' : 'Generate Tax Invoice & Deduct Stock'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Fiscal Calculation (NPR)</h2>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-bold text-white">NPR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Trade Discount:</span>
                  <span className="font-bold text-rose-400">- NPR {discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Taxable Amount:</span>
                  <span className="font-bold text-white">NPR {taxable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Nepal VAT (13%):</span>
                  <span className="font-bold text-amber-400">+ NPR {vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-base">
                  <span className="font-bold text-white">Grand Total:</span>
                  <span className="font-black text-emerald-400">NPR {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {generatedInvoice && (
              <div className="p-5 rounded-3xl bg-emerald-950/60 border border-emerald-700/80 space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  ✓ INVOICE ISSUED & STOCK RESERVED
                </span>
                <p className="text-xs text-emerald-200 font-mono">
                  Invoice <strong className="text-white">{generatedInvoice.invoice_number}</strong> created. Stock automatically decremented.
                </p>
                <a
                  href={`http://localhost:8000/sales/invoices/${generatedInvoice.invoice_number}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Download IRD Tax PDF ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
