"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/auth/LoginModal";

export default function Header() {
  const { user, isAuthenticated, logout, openLoginModal, token } = useAuth();

  const handlePrintLabels = async () => {
    if (!token) {
      openLoginModal();
      return;
    }

    try {
      const res = await fetch("/api/packaging/print-labels?lot_code=PK-2083-GUL-001", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert("Insufficient permissions. Requires OPERATOR role.");
          return;
        }
        throw new Error("Print failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "labels_PK-2083-GUL-001.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      alert("Failed to download PDF labels.");
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-900/60 text-purple-300 border-purple-700";
      case "MANAGER":
        return "bg-blue-900/60 text-blue-300 border-blue-700";
      case "OPERATOR":
      default:
        return "bg-emerald-900/60 text-emerald-300 border-emerald-700";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-600/30 group-hover:scale-105 transition">
                X
              </span>
              <div>
                <span className="font-bold tracking-tight text-white block text-sm sm:text-base leading-tight">
                  XIMALAYA COFFEE
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block leading-tight">
                  Farm-to-Pack ERP
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Action: PDF Sticker Sheet Generation */}
            <button
              onClick={handlePrintLabels}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 transition"
              title="Download 300 DPI A4 Sticker Sheet"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">Print Stickers</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-neutral-200 leading-tight">
                    {user.full_name}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 font-medium transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal />
    </>
  );
}
