"use client";

import React from "react";
import "../styles/globals.css";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "../lib/auth";

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">Mock SaaS Parking</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {loading ? (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">Checking session…</span>
            ) : user ? (
              <>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => router.push("/login") } className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Login
                </button>
                <button onClick={() => router.push("/signup") } className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Sign up
                </button>
                <button onClick={() => router.push("/demo") } className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Demo mode
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
