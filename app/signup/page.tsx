"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, signup, guestLogin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // additional registration fields
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [parkingRequired, setParkingRequired] = useState(false);
  const [openForCarpooling, setOpenForCarpooling] = useState(false);
  const [preferredCarpoolSpot, setPreferredCarpoolSpot] = useState("");
  const [monthlyLearningPoints, setMonthlyLearningPoints] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/reservations");
    }
  }, [loading, user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name,
      email,
      password,
      employeeNumber,
      vehicle: { make: vehicleMake, model: vehicleModel, plate: vehiclePlate },
      contactNumber,
      parkingRequired,
      openForCarpooling,
      preferredCarpoolSpot: preferredCarpoolSpot || null,
      monthlyLearningPoints: Number(monthlyLearningPoints) || 0,
    };

    const result = await signup(payload);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Something went wrong. Please try again.");
      return;
    }

    router.push("/reservations");
  };

  const handleGuest = () => {
    guestLogin();
    router.push("/reservations");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Create account</p>
          <h1 className="text-4xl font-bold text-slate-900">Join the demo parking app</h1>
          <p className="text-slate-600">Sign up to create reservations with your own user account, or use demo mode to explore instantly.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-900 focus:outline-none"
              placeholder="Jane Doe"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Employee #</span>
            <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} placeholder="E12345" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-900 focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Contact number</span>
            <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+1 555 987 6543" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Vehicle (make)</span>
            <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="Toyota" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Vehicle (model)</span>
            <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="Camry" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Vehicle plate</span>
            <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="ABC-1234" />
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={parkingRequired} onChange={(e) => setParkingRequired(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm">I need a parking space</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={openForCarpooling} onChange={(e) => setOpenForCarpooling(e.target.checked)} className="h-4 w-4" />
            <span className="text-sm">Open for carpooling</span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Preferred carpooling spot</span>
            <input className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" value={preferredCarpoolSpot} onChange={(e) => setPreferredCarpoolSpot(e.target.value)} placeholder="Near entrance" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Monthly learning points</span>
            <input type="number" min={0} value={monthlyLearningPoints} onChange={(e) => setMonthlyLearningPoints(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-800">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-900 focus:outline-none"
              placeholder="Choose a password"
              required
            />
          </label>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
            <button
              type="button"
              onClick={handleGuest}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Try demo mode
            </button>
          </div>
        </form>
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Already have an account? <Link href="/login" className="font-semibold text-slate-900 underline">Sign in</Link>.
          </p>
          <p className="text-slate-500">Demo mode is temporary and does not persist after refresh.</p>
        </div>
      </div>
    </main>
  );
}
