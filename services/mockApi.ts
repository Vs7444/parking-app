import { store, User, Reservation, WaitlistEntry } from "./store";

function mockLatency(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function obfuscatePassword(plain: string) {
  // intentional weak obfuscation only for mock purposes
  return "obf_" + plain;
}

function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function isTimeOverlap(startA: string, endA: string, startB: string, endB: string) {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  return aStart < bEnd && bStart < aEnd;
}

function formatSlotType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Stateless API wrapper for authentication. It validates credentials via the store,
// but does not retain any session state itself.
export const auth = {
  async signup(payload: { name: string; email: string; password: string; role?: string }) {
    await mockLatency(300);
    await store.init();

    const existing = store.findUserByEmail(payload.email);
    if (existing) {
      return { ok: false, status: 409, error: "Email already registered" };
    }

    const user: User = {
      id: generateId("u"),
      name: payload.name,
      email: payload.email,
      password: obfuscatePassword(payload.password),
      role: (payload.role as any) || "user",
      createdAt: new Date().toISOString(),
    };

    store.addUser(user);

    // create a session
    const session = {
      sessionId: generateId("s"),
      userId: user.id,
      issuedAt: new Date().toISOString(),
    };

    return { ok: true, status: 201, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, session } };
  },

  async login(payload: { email: string; password: string }) {
    await mockLatency(250);
    await store.init();

    const user = store.findUserByEmail(payload.email);
    if (!user) {
      return { ok: false, status: 401, error: "Invalid credentials" };
    }

    const obf = obfuscatePassword(payload.password);
    if (user.password !== obf) {
      return { ok: false, status: 401, error: "Invalid credentials" };
    }

    const session = {
      sessionId: generateId("s"),
      userId: user.id,
      issuedAt: new Date().toISOString(),
    };

    return { ok: true, status: 200, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, session } };
  },

  async logout() {
    await mockLatency(120);
    return { ok: true, status: 200 };
  },

  async getSession(session: { sessionId: string; userId: string; issuedAt: string }) {
    await mockLatency(120);
    await store.init();
    const user = store.data.users.find((u) => u.id === session.userId) || null;
    if (!user) return { ok: false, status: 404 };
    return { ok: true, status: 200, data: { session, user: { id: user.id, name: user.name, email: user.email, role: user.role } } };
  },
};

export const slots = {
  async list() {
    await mockLatency(150);
    await store.init();
    return { ok: true, data: store.listSlots() };
  },
};

export const reservations = {
  async list(payload?: { userId?: string }) {
    await mockLatency(200);
    await store.init();
    return { ok: true, data: store.listReservations(payload?.userId) };
  },

  async create(payload: { userId: string; slotId: string; startsAt: string; endsAt: string }) {
    await mockLatency(300);
    await store.init();

    const slot = store.findSlotById(payload.slotId);
    if (!slot || slot.status !== "active") {
      return { ok: false, status: 404, error: "Selected slot is not available" };
    }

    if (new Date(payload.endsAt).getTime() <= new Date(payload.startsAt).getTime()) {
      return { ok: false, status: 400, error: "End time must be after start time" };
    }

    const overlapping = store.data.reservations.some((reservation) => {
      return reservation.slotId === payload.slotId && isTimeOverlap(reservation.startsAt, reservation.endsAt, payload.startsAt, payload.endsAt) && reservation.status === "confirmed";
    });

    if (overlapping) {
      return { ok: false, status: 409, error: "Slot is already reserved for the selected time" };
    }

    const reservation: Reservation = {
      id: generateId("r"),
      userId: payload.userId,
      slotId: payload.slotId,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const persist = !payload.userId.startsWith("guest_");
    store.addReservation(reservation, persist);
    return { ok: true, status: 201, data: reservation };
  },

  async availableSlots(payload: { startsAt: string; endsAt: string; slotType?: string; userId?: string }) {
    await mockLatency(200);
    await store.init();

    const activeSlots = store.listSlots().filter((s) => s.status === "active");
    const guestReservations = payload.userId?.startsWith("guest_") ? store.guestReservations.filter((reservation) => reservation.userId === payload.userId) : [];
    const allReservations = [...store.data.reservations, ...guestReservations];

    const available = activeSlots.filter((slot) => {
      if (payload.slotType && slot.type !== payload.slotType) {
        return false;
      }
      return !allReservations.some((reservation) => {
        return reservation.slotId === slot.id && reservation.status === "confirmed" && isTimeOverlap(reservation.startsAt, reservation.endsAt, payload.startsAt, payload.endsAt);
      });
    });

    return { ok: true, status: 200, data: available };
  },
};

export const waitlist = {
  async list(payload?: { userId?: string }) {
    await mockLatency(150);
    await store.init();
    return { ok: true, data: store.listWaitlist(payload?.userId) };
  },

  async join(payload: { userId: string; requestedStartsAt: string; requestedEndsAt: string; slotType: string }) {
    await mockLatency(250);
    await store.init();

    const entry: WaitlistEntry = {
      id: generateId("w"),
      userId: payload.userId,
      requestedStartsAt: payload.requestedStartsAt,
      requestedEndsAt: payload.requestedEndsAt,
      slotType: payload.slotType,
      createdAt: new Date().toISOString(),
    };

    const persist = !payload.userId.startsWith("guest_");
    store.addWaitlistEntry(entry, persist);
    return { ok: true, status: 201, data: entry };
  },
};

export default { auth, slots, reservations, waitlist };
