// src/lib/api.ts
import { Endpoints } from "../config/urls";
// Domain types
import type { Patient, Visit, Doctor, Payment, PaymentPreview,  DoctorCreateInput, DoctorAttendance, ReceptionAnalytics, 
    AdminFinancials,
    Period,
     AdminAnalytics,
     PaymentSearchQuery, 
     PaymentSearchResult

 } from "../../types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiOptions = {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean; // attach bearer automatically
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem("smh_token"); } catch { return null; }
}

export async function apiFetch<T = unknown>(
  url: string,
  opts: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, auth = false } = opts;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* keep raw text */ }

  // unwrap { message, data } shape if present
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;

  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      text ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return payload as T;
}

/* ------------ Auth endpoints ------------ */

export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  token: string;
  refreshToken?: string;
  role?: "admin" | "receptionist" | "pharmacy";
  permissions?: string[];
};

export async function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(Endpoints.login, { method: "POST", body, auth: false });
}

export async function refresh(refreshToken: string): Promise<{ token: string }> {
  return apiFetch<{ token: string }>(Endpoints.refresh, {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}

/* ------------ Session helpers ------------ */
export function setSession(role: string | null, token?: string, refreshToken?: string) {
  // cookie for middleware/Header
  if (typeof document !== "undefined") {
    if (role) {
      document.cookie = `smh_role=${encodeURIComponent(role)}; path=/; max-age=${60 * 60 * 24 * 30}`;
    } else {
      document.cookie = "smh_role=; path=/; max-age=0";
    }
  }
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem("smh_token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (role) localStorage.setItem("smh_role", role);
    if (!role) {
      localStorage.removeItem("smh_token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("smh_role");
    }
  }
}

/* ------------ Patients API ------------ */

export async function getPatientByCard(cardNo: string) {
  return apiFetch<{ patient: Patient | null }>(Endpoints.patients.byCard(cardNo), { auth: true });
}

export async function upsertPatient(p: Partial<Patient>) {
  // server decides: create or update by cardNo
  return apiFetch<{ patient: Patient }>(Endpoints.patients.createOrUpdate, {
    method: "POST",
    body: p,
    auth: true,
  });
}

export async function addVisit(v: Omit<Visit, "_id">) {
  return apiFetch<{ visit: Visit }>(Endpoints.patients.addVisit, {
    method: "POST",
    body: v,
    auth: true,
  });
}

export async function getVisits(cardNo: string) {
  return apiFetch<{ visits: Visit[] }>(Endpoints.patients.visitsOf(cardNo), { auth: true });
}

export async function listDoctors() {
  return apiFetch<{ doctors: Doctor[] }>(Endpoints.doctors.list, { auth: true });
}

/* ------------ Reception Payments API ------------ */

export async function paymentSearch(criteria: {
  cardNo?: string;
  name?: string;
  phone?: string;
  idProofNo?: string;
  idProofType?: string;
}) {
  const results = await apiFetch<PaymentPreview[]>(Endpoints.payments.search, {
    method: "POST",
    body: criteria,
    auth: true,
  });
  return { results };
}

export async function paymentPreview(cardNo: string) {
  const preview = await apiFetch<PaymentPreview>(Endpoints.payments.preview, {
    method: "POST",
    body: { cardNo },
    auth: true,
  });
  return { preview };
}

export async function createPayment(payload: Payment) {
  const payment = await apiFetch<Payment>(Endpoints.payments.create, {
    method: "POST",
    body: payload,
    auth: true,
  });
  return { payment };
}

export async function listPayments(cardNo: string) {
  const payments = await apiFetch<Payment[]>(Endpoints.payments.listByCard(cardNo), {
    method: "GET",
    auth: true,
  });
  return { payments };
}

/* ------------ Doctors API ------------ */
export async function createDoctor(body: DoctorCreateInput) {
  const res = await apiFetch<{ doctor: Doctor }>(Endpoints.doctors.create, {
    method: "POST",
    body,
    auth: true,
  });
  return res; // { doctor }
}

export async function updateDoctor(id: string, patch: Partial<DoctorCreateInput>) {
  const res = await apiFetch<{ doctor: Doctor }>(Endpoints.doctors.update(id), {
    method: "PUT",
    body: patch,
    auth: true,
  });
  return res;
}

export async function toggleDoctorActive(id: string, active: boolean) {
  const res = await apiFetch<{ doctor: Doctor }>(Endpoints.doctors.toggleActive(id), {
    method: "PATCH",
    body: { active },
    auth: true,
  });
  return res;
}

export async function searchDoctors(q: Partial<Record<"name"|"dept"|"specialty"|"phone", string>>) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => { if (v) params.set(k, v); });
  const url = `${Endpoints.doctors.search}?${params.toString()}`;
  return apiFetch<{ doctors: Doctor[] }>(url, { auth: true });
}

export async function listAllDoctors() {
  return apiFetch<{ doctors: Doctor[] }>(Endpoints.doctors.list, { auth: true });
}

/* Attendance */
export async function checkInDoctor(id: string, notes?: string) {
  return apiFetch<{ attendance: DoctorAttendance }>(Endpoints.doctors.attendance.checkIn(id), {
    method: "POST",
    body: { notes },
    auth: true,
  });
}

export async function checkOutDoctor(id: string, notes?: string) {
  return apiFetch<{ attendance: DoctorAttendance }>(Endpoints.doctors.attendance.checkOut(id), {
    method: "POST",
    body: { notes },
    auth: true,
  });
}

export async function attendanceToday() {
  return apiFetch<{ rows: DoctorAttendance[] }>(Endpoints.doctors.attendance.today, { auth: true });
}

export async function attendanceRange(fromISO: string, toISO: string) {
  return apiFetch<{ rows: DoctorAttendance[] }>(Endpoints.doctors.attendance.range(fromISO, toISO), { auth: true });
}

// -------- Analytics API (with graceful mock fallback) --------

export async function getReceptionAnalytics(): Promise<ReceptionAnalytics> {
  return apiFetch<ReceptionAnalytics>(Endpoints.analytics.reception, { auth: true });
}

export async function getAdminAnalytics(period: Period = "month"): Promise<AdminAnalytics> {
  const url = `${Endpoints.analytics.admin}?period=${encodeURIComponent(period)}`;
  return apiFetch<AdminAnalytics>(url, { auth: true });
}

export async function searchPayments(q: PaymentSearchQuery) {
  return apiFetch<PaymentSearchResult>(Endpoints.payments.search, {
    method: "POST",
    auth: true,
    body: q,
  });
}

export async function exportPaymentsPdf(q: PaymentSearchQuery): Promise<Blob> {
  const res = await fetch(Endpoints.payments.exportPdf, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: JSON.stringify(q),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Export failed (${res.status})`);
  }
  return await res.blob();
}

