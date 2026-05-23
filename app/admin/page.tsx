"use client";

import { useEffect, useState } from "react";
import { admin } from "../../services/mockApi";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [dailySlots, setDailySlots] = useState(150);
  const [unauthorizedEvents, setUnauthorizedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadUnauthorizedEvents();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await admin.listUsers();
    if (res.ok) setUsers(res.data || []);
    setLoading(false);
  };

  const loadUnauthorizedEvents = async () => {
    setLoading(true);
    const res = await admin.listUnauthorizedParkings();
    if (res.ok) setUnauthorizedEvents(res.data || []);
    setLoading(false);
  };

  const assignDesignated = async () => {
    setLoading(true);
    await admin.assignDesignatedSlots({ count: 100 });
    setMessage("Assigned 100 designated slots (demo)");
    setLoading(false);
  };

  const assignPriority = async () => {
    setLoading(true);
    const res = await admin.assignPriorityPasses({ topN: 50 });
    if (res.ok) setMessage("Assigned priority passes to top 50 learners");
    await loadUsers();
    setLoading(false);
  };

  const updateDailySlots = async () => {
    setLoading(true);
    const res = await admin.setDailyActiveSlots({ count: dailySlots });
    if (res.ok) setMessage(`Updated daily active parking slots to ${dailySlots}`);
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin — Parking Controls</h1>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button onClick={assignDesignated} className="rounded-full bg-slate-900 px-4 py-2 text-white">Assign 100 Designated Slots</button>
        <button onClick={assignPriority} className="rounded-full border border-slate-300 px-4 py-2">Assign Top 50 Priority Passes</button>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Daily active slots</label>
          <input
            type="number"
            min={0}
            max={150}
            value={dailySlots}
            onChange={(event) => setDailySlots(Number(event.target.value))}
            className="w-24 rounded-2xl border border-slate-300 px-3 py-2"
          />
          <button onClick={updateDailySlots} className="rounded-full border border-slate-300 bg-white px-4 py-2">Save</button>
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-xl font-semibold">Users (top learners flagged)</h2>
          {loading ? <p>Loading…</p> : null}
          <div className="mt-4 grid gap-2">
            {users.slice(0, 200).map((u) => (
              <div key={u.id} className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{u.name} {u.priorityPass ? <span className="ml-2 text-sm text-amber-600">(Priority)</span> : null}</div>
                  <div className="text-sm text-slate-600">{u.email} • Points: {u.monthlyLearningPoints || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-rose-900">Unauthorized parking</h2>
          {unauthorizedEvents.length ? (
            <div className="mt-4 space-y-3">
              {unauthorizedEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-rose-200 bg-white p-4">
                  <p className="font-semibold">Event {event.id}</p>
                  <p className="text-sm text-slate-600">User: {event.userId}</p>
                  <p className="text-sm text-slate-600">Slot: {event.slotId}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-rose-700">Unauthorized</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-600">No unauthorized parking events detected.</p>
          )}
        </div>
      </section>
    </main>
  );
}
