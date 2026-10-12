"use client";

import React from "react";

interface PrintLabelButtonProps {
  lotCode: string;
}

export default function PrintLabelButton({ lotCode }: PrintLabelButtonProps) {
  const handlePrint = () => {
    const url = `/api/packaging/print-labels?lot_code=${encodeURIComponent(lotCode)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-medium transition-all shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      title="Open 300 DPI A4 Sticker Sheet for in-browser printing"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      <span>Print Sticker Sheet</span>
    </button>
  );
}
