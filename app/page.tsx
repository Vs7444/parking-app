"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-white">Mock SaaS Parking</p>
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">Parking management for teams and facilities.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Book parking slots, manage waitlists, and demo the full experience with no backend required. Built as a polished MVP with mock auth and reservation flows.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700">
                Login
              </Link>
              <Link href="/signup" className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Sign up
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100">
                Try demo mode
              </Link>
            </div>
          </div>
          <div className="rounded-5xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
            <div className="space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700">Checking your login status…</div>
              ) : user ? (
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Signed in</p>
                  <p className="text-2xl font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-600">You can proceed to reservations or continue exploring the app.</p>
                  <Link href="/reservations" className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
                    Open Reservations
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">New here?</p>
                  <p className="text-2xl font-semibold text-slate-900">Start a demo or log in.</p>
                  <p className="text-sm text-slate-600">Choose login, sign up, or try the app as a demo user without persistence.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
