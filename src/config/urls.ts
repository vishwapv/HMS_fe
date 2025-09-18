// src/config/urls.ts
// Centralized URL config for dev/stage/prod

export const ENV =
  (process.env.NEXT_PUBLIC_ENV as "dev" | "stage" | "prod") || "dev";

const BASES = {
  dev: "http://localhost:4001/api/v0",
  stage: "https://stage.api.your-hms.com/api/v0",
  prod: "https://api.your-hms.com/api/v0",
} as const;

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || BASES[ENV]).replace(/\/+$/, "");

export const Endpoints = {
  signup: `${API_BASE}/users/signup`,
  login: `${API_BASE}/users/login`,
  refresh: `${API_BASE}/users/refresh`,
//   ...Endpoints,
  patients: {
    byCard: (card: string) => `${API_BASE}/patients/${encodeURIComponent(card)}`,
    createOrUpdate: `${API_BASE}/patients`,
    visitsOf: (card: string) => `${API_BASE}/patients/${encodeURIComponent(card)}/visits`,
    addVisit: `${API_BASE}/patients/visit`,
  },
//   doctors: {
//     list: `${API_BASE}/doctors`,
//   },

  // domain APIs (expand as you build)
//   patients: `${API_BASE}/patients`,
  pharmacy: `${API_BASE}/pharmacy`,
  analyticsRevenue: `${API_BASE}/analytics/revenue`,
  
  // NEW: payments
// add inside Endpoints (payments group)
payments: {
  preview: `${API_BASE}/payments/preview`,
  search:  `${API_BASE}/payments/search`,   // NEW
  create:  `${API_BASE}/payments`,
  exportPdf: `${API_BASE}/payments/export`,
  listByCard: (card: string) => `${API_BASE}/payments/${encodeURIComponent(card)}`,
},

// inside Endpoints (keep existing)
doctors: {
  list: `${API_BASE}/doctors`,
  search: `${API_BASE}/doctors/search`,
  create: `${API_BASE}/doctors`,
  update: (id: string) => `${API_BASE}/doctors/${encodeURIComponent(id)}`,
  toggleActive: (id: string) => `${API_BASE}/doctors/${encodeURIComponent(id)}/active`,
  attendance: {
    checkIn: (id: string) => `${API_BASE}/doctors/${encodeURIComponent(id)}/checkin`,
    checkOut: (id: string) => `${API_BASE}/doctors/${encodeURIComponent(id)}/checkout`,
    today: `${API_BASE}/doctors/attendance/today`,
    range: (from: string, to: string) => `${API_BASE}/doctors/attendance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  },
},
// Add this block anywhere inside Endpoints (keep existing keys)
analytics: {
  reception: `${API_BASE}/analytics/reception`, // if BE not ready, FE will gracefully mock
  admin: `${API_BASE}/analytics/admin`,
},
} as const;
