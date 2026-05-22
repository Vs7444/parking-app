"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { reservations as reservationsApi, slots as slotsApi, waitlist as waitlistApi } from "../../services/mockApi";
import { useAuth } from "../../lib/auth";
import type { Slot, Reservation, WaitlistEntry } from "../../services/store";

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatSlotType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function ReservationsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [startsAt, setStartsAt] = useState("2026-06-01T08:00");
  const [endsAt, setEndsAt] = useState("2026-06-01T12:00");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSlot = useMemo(() => slots.find((slot) => slot.id === selectedSlotId) || null, [slots, selectedSlotId]);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (startsAt && endsAt) {
      refreshAvailability();
    }
  }, [startsAt, endsAt, user?.id]);

  const loadData = async () => {
    setLoading(true);
    const slotsRes = await slotsApi.list();
    if (slotsRes.ok) {
      setSlots(slotsRes.data);
    }

    if (user?.id) {
      const reservationsRes = await reservationsApi.list({ userId: user.id });
      if (reservationsRes.ok) {
        setReservations(reservationsRes.data);
      }

      const waitlistRes = await waitlistApi.list({ userId: user.id });
      if (waitlistRes.ok) {
        setWaitlist(waitlistRes.data);
      }
    } else {
      setReservations([]);
      setWaitlist([]);
    }

    setLoading(false);
  };

  const refreshAvailability = async () => {
    setLoading(true);
    setError(null);
    const availRes = await reservationsApi.availableSlots({ startsAt, endsAt, userId: user?.id });
    if (availRes.ok) {
      setAvailableSlots(availRes.data);
      if (!availRes.data.find((slot: Slot) => slot.id === selectedSlotId)) {
        setSelectedSlotId("");
      }
    }
    setLoading(false);
  };

  const handleReserve = async () => {
    setError(null);
    setMessage(null);
    if (!selectedSlotId) {
      setError("Please select a slot to reserve.");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a reservation.");
      router.push("/login");
      return;
    }

    setLoading(true);
    const result = await reservationsApi.create({
      userId: user.id,
      slotId: selectedSlotId,
      startsAt,
      endsAt,
    });
    setLoading(false);

    if (!result.ok) {
      setError((result as any).error || "Reservation failed.");
      return;
    }

    setMessage("Reservation created successfully.");
    await loadData();
  };

  const handleJoinWaitlist = async () => {
    setError(null);
    setMessage(null);

    if (!user) {
      setError("You must be logged in to join the waitlist.");
      router.push("/login");
      return;
    }

    setLoading(true);
    const entryResult = await waitlistApi.join({
      userId: user.id,
      requestedStartsAt: startsAt,
      requestedEndsAt: endsAt,
      slotType: selectedSlot?.type ?? "regular",
    });
    setLoading(false);

    if (!entryResult.ok) {
      setError((entryResult as any).error || "Unable to join waitlist.");
      return;
    }

    setMessage("Added to the waitlist.");
    await loadData();
  };

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Parking Reservations</h1>
            <p className="mt-2 text-slate-600">Browse slots, check availability, create reservations, and join the waitlist.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            User: <strong>{authLoading ? "Loading..." : user ? user.name : "Guest"}</strong>
          </div>
        </div>
        {!authLoading && !user ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <p className="mb-3">Please sign in, sign up, or try the demo mode to make a reservation.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={() => router.push("/login")} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
                Login
              </button>
              <button onClick={() => router.push("/signup")} className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Sign up
              </button>
              <button onClick={() => router.push("/demo")} className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Try demo mode
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Reservation request</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-800">Start time</span>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-900 focus:outline-none"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-800">End time</span>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-slate-900 focus:outline-none"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                />
              </label>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Available slots</h3>
              {loading ? (
                <p className="mt-3 text-slate-600">Checking availability…</p>
              ) : availableSlots.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${selectedSlotId === slot.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900 hover:border-slate-900"}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-lg font-semibold">{slot.label}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase text-slate-700">{slot.type}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Zone {slot.zone}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-slate-600">No slots available for the selected time window.</p>
              )}
            </div>
            {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            {message ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleReserve}
                disabled={loading || authLoading}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing…" : "Book selected slot"}
              </button>
              <button
                type="button"
                onClick={handleJoinWaitlist}
                disabled={loading || authLoading}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing…" : "Join waitlist"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Your reservations</h2>
            {reservations.length ? (
              <div className="mt-4 space-y-3">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold">Reservation {reservation.id}</p>
                    <p className="text-sm text-slate-600">Slot {reservation.slotId} • {formatDateTime(reservation.startsAt)} – {formatDateTime(reservation.endsAt)}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{reservation.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-600">No reservations yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Slot inventory</h2>
            <div className="mt-4 grid gap-3">
              {slots.map((slot) => (
                <div key={slot.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{slot.label}</p>
                      <p className="text-sm text-slate-600">Zone {slot.zone} • {slot.type}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{slot.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Waitlist entries</h2>
            {waitlist.length ? (
              <div className="mt-4 space-y-3">
                {waitlist.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold">Entry {entry.id}</p>
                    <p className="text-sm text-slate-600">{formatDateTime(entry.requestedStartsAt)} – {formatDateTime(entry.requestedEndsAt)}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Slot type: {formatSlotType(entry.slotType)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-600">No waitlist entries yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
