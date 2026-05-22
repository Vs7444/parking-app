"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";

export default function DemoPage() {
  const router = useRouter();
  const { guestLogin } = useAuth();

  useEffect(() => {
    guestLogin();
    router.push("/reservations");
  }, [guestLogin, router]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Starting demo mode…</h1>
        <p className="mt-4 text-slate-600">Preparing a temporary demo session now. You will be redirected shortly.</p>
      </div>
    </main>
  );
}
