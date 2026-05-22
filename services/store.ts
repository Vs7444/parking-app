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
};

export type Slot = {
  id: string;
  label: string;
  zone: string;
  type: "regular" | "compact" | "ev";
  status: "active" | "disabled";
};

export type Reservation = {
  id: string;
  userId: string;
  slotId: string;
  startsAt: string;
  endsAt: string;
  status: "confirmed" | "cancelled" | "completed";
  createdAt: string;
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
          this.data = { ...this.data, ...seed };
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
