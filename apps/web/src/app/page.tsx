import React from "react";
import Link from "next/link";

const MODULES = [
  {
    title: "Lot Traceability (Public)",
    desc: "Scan-ready farm-to-cup origin pages with PostGIS cadastral parcels and SCA cupping scores.",
    href: "/lot/PK-2083-GUL-001",
    badge: "Public QR",
    color: "amber",
    icon: "🗺️",
  },
  {
    title: "Field Intake Station",
    desc: "Mobile-first cherry collection with real-time weighing scale and farmer payouts.",
    href: "/intake/mobile",
    badge: "Field Ops",
    color: "emerald",
    icon: "⚖️",
  },
  {
    title: "Spatial Cadastral Map",
    desc: "Interactive PostGIS cadastral plot boundaries and deforestation cut-off overlays.",
    href: "/traceability/map",
    badge: "GIS / EUDR",
    color: "blue",
    icon: "🛰️",
  },
  {
    title: "Dry & Wet Milling",
    desc: "Batch fermentation tracking, parchment hulling, and sorting yield reconciliation.",
    href: "/milling",
    badge: "Processing",
    color: "orange",
    icon: "⚙️",
  },
  {
    title: "Live Artisan Roasting",
    desc: "Real-time thermal RoR curve telemetry and Agtron color classification.",
    href: "/roasting/live",
    badge: "Roastery",
    color: "red",
    icon: "🔥",
  },
  {
    title: "SCA Cupping & QC",
    desc: "Specialty Coffee Association standardized sensory evaluation and defect profiling.",
    href: "/roasting/cupping",
    badge: "Quality Lab",
    color: "purple",
    icon: "☕",
  },
  {
    title: "Warehouse & Green Inventory",
    desc: "GrainPro pallet tracking, moisture drift monitoring, and physical inventory audits.",
    href: "/warehouse",
    badge: "Inventory",
    color: "cyan",
    icon: "📦",
  },
  {
    title: "Packaging & 24-Up Labeling",
    desc: "Zebra & laser sheet label printing with cryptographically verifiable QR codes.",
    href: "/packaging",
    badge: "Packaging",
    color: "yellow",
    icon: "🏷️",
  },
  {
    title: "EUDR Compliance Engine",
    desc: "Regulation (EU) 2023/1115 Article 4 Due Diligence Statements and CRS84 GeoJSON export.",
    href: "/api/compliance/eudr/statement",
    badge: "Customs API",
    color: "teal",
    icon: "🇪🇺",
    external: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="border border-neutral-800 rounded-3xl bg-neutral-900/60 backdrop-blur p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span>● Production Node Active</span>
              <span className="text-neutral-500">|</span>
              <span>103.254.186.194:55555</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ximalaya Specialty Coffee ERP
            </h1>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
              Enterprise farm-to-cup traceability, PostGIS cadastral polygon verification,
              and automated EUDR Article 4 Due Diligence for Himalayan single-origin coffees.
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              target={mod.external ? "_blank" : undefined}
              className="group border border-neutral-800/80 hover:border-amber-500/50 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/80 p-6 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-amber-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50 inline-block">
                    {mod.icon}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-neutral-700 bg-neutral-800 text-neutral-300">
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold group-hover:text-amber-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-normal">
                  {mod.desc}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-medium text-amber-500 group-hover:translate-x-1 transition-transform">
                <span>Open module</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* System Diagnostics Bar */}
        <div className="border border-neutral-800 rounded-2xl bg-neutral-900/30 p-4 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> PostGIS DB: <strong className="text-neutral-200">Connected</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Redis: <strong className="text-neutral-200">Healthy</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> EUDR Compliance: <strong className="text-neutral-200">Article 4 Verified</strong>
            </span>
          </div>
          <div className="font-mono text-[11px] text-neutral-500">
            Reg (EU) 2023/1115 • ISO 19115 CRS84
          </div>
        </div>
      </div>
    </div>
  );
}
