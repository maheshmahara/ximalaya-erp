"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal() {
  const { isModalOpen, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid credentials");
      }

      const data = await res.json();
      login(data.access_token, {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      });
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-white">
        <button
          onClick={closeLoginModal}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <span className="text-xs font-semibold tracking-wider text-amber-500 uppercase">
            Ximalaya Coffee ERP
          </span>
          <h2 className="text-xl font-bold mt-1">Operator Authentication</h2>
          <p className="text-sm text-neutral-400">
            Sign in to access warehouse printing, payout settlements, and EUDR exports.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950/60 border border-red-800/80 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email / Username</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@ximalayacoffee.com"
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 hover:bg-amber-500 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Sign In to ERP"}
          </button>
        </form>

        <div className="mt-6 border-t border-neutral-800 pt-4">
          <p className="text-xs text-neutral-400 mb-2 font-medium">Quick Credentials (Demo / Testing):</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreset("operator.wh1@ximalayacoffee.com", "OperatorPass_2083!")}
              className="rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1 text-xs text-neutral-300 font-mono transition"
            >
              Operator
            </button>
            <button
              type="button"
              onClick={() => setPreset("manager.ruru@ximalayacoffee.com", "ManagerPass_2083!")}
              className="rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1 text-xs text-neutral-300 font-mono transition"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => setPreset("admin@ximalayacoffee.com", "AdminProductionPass_2083!")}
              className="rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1 text-xs text-neutral-300 font-mono transition"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
