// src/lib/api.ts
// Centralized API caller for the front end (fetch wrapper + endpoints)

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiOptions = {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  // Add Authorization header from localStorage token by default
  auth?: boolean;
  // Pass through other fetch options if needed
  cache?: RequestCache;
  next?: { revalidate?: number };
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("smh_token");
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    auth = true,
    cache,
    next,
  } = opts;

  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const token = auth ? getToken() : null;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as any) : null;

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

/** ---------- Auth ---------- */

export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  token: string;
  role: "admin" | "receptionist" | "pharmacy";
  user?: { id: string; name: string; email: string };
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("smh_token");
    localStorage.removeItem("smh_role");
    localStorage.removeItem("smh-user");
  }
}

/** ---------- Patients ---------- */

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  phone?: string;
  mrn?: string; // medical record number / unique id
};

export async function getPatients(query?: string): Promise<Patient[]> {
  const q = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiFetch<Patient[]>(`/patients${q}`, { method: "GET" });
}

export type CreatePatientRequest = {
  firstName: string;
  lastName: string;
  dob?: string;
  phone?: string;
};

export async function createPatient(
  payload: CreatePatientRequest
): Promise<Patient> {
  return apiFetch<Patient>("/patients", { method: "POST", body: payload });
}

/** ---------- Pharmacy ---------- */

export type Medicine = {
  id: string;
  name: string;
  stock?: number;
  unit?: string;
};

export async function getMedicines(query?: string): Promise<Medicine[]> {
  const q = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiFetch<Medicine[]>(`/medicines${q}`, { method: "GET" });
}

/** ---------- Analytics (income/revenue) ---------- */

export type RevenuePoint = { date: string; amount: number; department?: string };
export type RevenueSummary = {
  period: "day" | "week" | "month";
  total: number;
  byDepartment: { department: string; total: number }[];
  series: RevenuePoint[];
};

export async function getRevenueSummary(
  period: "day" | "week" | "month"
): Promise<RevenueSummary> {
  return apiFetch<RevenueSummary>(`/analytics/revenue?period=${period}`, {
    method: "GET",
  });
}

/** ---------- Utilities ---------- */

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("smh_token", token);
  else localStorage.removeItem("smh_token");
}
