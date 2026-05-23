/* Minimal in-memory store with optional localStorage persistence
   - Loads seed from /mock/seed.json on first client init
   - Persists only application data (users, slots, reservations, waitlist)
   - No authentication UI state or session state is stored here
*/

type Role = "user" | "employee" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // obfuscated string in seed
  role: Role;
  disabled?: boolean;
  createdAt?: string;

  // extended registration fields
  employeeNumber?: string;
  vehicle?: { make?: string; model?: string; plate?: string } | null;
  contactNumber?: string;
  parkingRequired?: boolean;
  openForCarpooling?: boolean;
  preferredCarpoolSpot?: string | null;
  monthlyLearningPoints?: number;
  priorityPass?: boolean;
};

export type Slot = {
  id: string;
  label: string;
  zone: string;
  type: "regular" | "compact" | "ev";
  status: "active" | "disabled";
  designated?: boolean;
  priority?: boolean;
};

export type Reservation = {
  id: string;
  userId: string;
  slotId: string;
  startsAt: string;
  endsAt: string;
  status: "confirmed" | "parked" | "cancelled" | "completed";
  createdAt: string;
  unauthorized?: boolean;
};

export type WaitlistEntry = {
  id: string;
  userId: string;
  requestedStartsAt: string;
  requestedEndsAt: string;
  slotType: string;
  createdAt: string;
};

const STORAGE_KEY = "parking_app_store_v1";

export class Store {
  data: {
    users: User[];
    slots: Slot[];
    reservations: Reservation[];
    waitlist: WaitlistEntry[];
  };

  guestReservations: Reservation[] = [];
  guestWaitlist: WaitlistEntry[] = [];
  initialized = false;

  constructor() {
    this.data = { users: [], slots: [], reservations: [], waitlist: [] };
  }

  async init() {
    if (this.initialized) return;
    // Try localStorage first
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          this.data = JSON.parse(raw);
          this.ensureSlotFlags();
          this.initialized = true;
          return;
        } catch (e) {
          // ignore and fall through to fetch seed
        }
      }

      // fetch seed from public/mock/seed.json
      try {
        const res = await fetch("/mock/seed.json");
        if (res.ok) {
          const seed = await res.json();
          // merge basic seed fields
          this.data = { ...this.data, ...seed };

          // if seed provides meta for generation, synthesize users and slots
          if ((seed as any).meta) {
            const meta = (seed as any).meta;
            const employeeCount = meta.employeeCount || 1500;
            const parkingSpaces = meta.parkingSpaces || 150;

            // ensure baseline admin/sample users exist
            this.data.users = (seed.users || []).slice();
            const ensureUser = (u: any) => {
              if (!this.data.users.find((x) => x.email === u.email)) this.data.users.push(u);
            };
            ensureUser({ id: "u_admin", name: "Admin User", email: "admin@example.com", password: "obf_admin_pwd", role: "admin", disabled: false, createdAt: new Date().toISOString() });
            ensureUser({ id: "u_employee", name: "Employee", email: "employee@example.com", password: "obf_emp_pwd", role: "employee", disabled: false, createdAt: new Date().toISOString() });
            ensureUser({ id: "u_user", name: "Regular User", email: "user@example.com", password: "obf_user_pwd", role: "user", disabled: false, createdAt: new Date().toISOString() });

            const zones = ["A", "B", "C", "D", "E"];
            const types: Array<Slot["type"]> = ["regular", "compact", "ev"];

            // generate additional employees up to employeeCount
            const existing = this.data.users.length;
            for (let i = existing; i < employeeCount; i++) {
              const idx = i + 1;
              const needsParking = idx % 4 === 0;
              const learningPoints = Math.floor(Math.random() * 200);
              const carpools = idx % 6 === 0;
              const zone = zones[i % zones.length];
              this.data.users.push({
                id: `u_${idx}`,
                name: `Employee ${idx}`,
                email: `employee${idx}@example.com`,
                password: `obf_pwd${idx}`,
                role: "employee",
                disabled: false,
                createdAt: new Date().toISOString(),
                employeeNumber: `E${10000 + idx}`,
                vehicle: needsParking ? { make: ["Toyota", "Honda", "Ford", "BMW", "Audi"][idx % 5], model: `Model ${idx % 10}`, plate: `PLT${1000 + idx}` } : null,
                contactNumber: `+1-555-${1000 + (idx % 9000)}`,
                parkingRequired: needsParking,
                openForCarpooling: carpools,
                preferredCarpoolSpot: carpools ? `Zone ${zone}` : null,
                monthlyLearningPoints: learningPoints,
              });
            }

            // generate parking slots
            this.data.slots = [];
            for (let i = 0; i < parkingSpaces; i++) {
              const zone = zones[i % zones.length];
              const label = `${zone}${i + 1}`;
              this.data.slots.push({ id: `slot_${i + 1}`, label, zone, type: types[i % types.length], status: "active", designated: i < 100, priority: i >= 100 && i < 150 });
            }
          }
        }
      } catch (e) {
        // ignore, keep empty
      }

      this.persist();
      this.initialized = true;
    }
  }

  persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      // noop
    }
  }

  // USER APIs
  listUsers() {
    return this.data.users.slice();
  }

  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  addUser(user: User) {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  listSlots() {
    return this.data.slots.slice();
  }

  findSlotById(slotId: string) {
    return this.data.slots.find((slot) => slot.id === slotId) || null;
  }

  private isGuestUserId(userId: string) {
    return userId.startsWith("guest_");
  }

  addReservation(reservation: Reservation, persist = true) {
    if (persist) {
      this.data.reservations.push(reservation);
      this.persist();
    } else {
      this.guestReservations.push(reservation);
    }
    return reservation;
  }

  listReservations(userId?: string) {
    if (!userId) {
      return [] as Reservation[];
    }

    if (this.isGuestUserId(userId)) {
      return this.guestReservations.filter((reservation) => reservation.userId === userId).slice();
    }

    return this.data.reservations.filter((reservation) => reservation.userId === userId).slice();
  }

  listAllReservations() {
    return this.data.reservations.slice();
  }

  findReservationById(reservationId: string) {
    return this.data.reservations.find((reservation) => reservation.id === reservationId) || null;
  }

  updateReservation(reservation: Reservation) {
    const index = this.data.reservations.findIndex((r) => r.id === reservation.id);
    if (index >= 0) {
      this.data.reservations[index] = reservation;
      this.persist();
    }
    return reservation;
  }

  setDailyActiveSlots(count: number) {
    this.data.slots = this.data.slots.map((slot, index) => ({ ...slot, status: index < count ? "active" : "disabled" }));
    this.persist();
  }

  ensureSlotFlags() {
    if (!this.data.slots?.length) return;
    const hasDesignated = this.data.slots.some((slot) => slot.designated === true);
    const hasPriority = this.data.slots.some((slot) => slot.priority === true);
    if (!hasDesignated || !hasPriority) {
      this.data.slots = this.data.slots.map((slot, index) => ({
        ...slot,
        designated: hasDesignated ? slot.designated : index < 100,
        priority: hasPriority ? slot.priority : index >= 100 && index < 150,
      }));
      this.persist();
    }
  }

  addWaitlistEntry(entry: WaitlistEntry, persist = true) {
    if (persist) {
      this.data.waitlist.push(entry);
      this.persist();
    } else {
      this.guestWaitlist.push(entry);
    }
    return entry;
  }

  listWaitlist(userId?: string) {
    if (!userId) {
      return [] as WaitlistEntry[];
    }

    if (this.isGuestUserId(userId)) {
      return this.guestWaitlist.filter((entry) => entry.userId === userId).slice();
    }

    return this.data.waitlist.filter((entry) => entry.userId === userId).slice();
  }
}

// Export a singleton store
export const store = new Store();
