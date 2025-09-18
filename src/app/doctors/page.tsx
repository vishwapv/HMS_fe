// src/app/reception/doctors/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./page.module.css";
import { toast } from "../../lib/toast";
import type { Doctor, DoctorAttendance, DoctorCreateInput } from "../../../types";
import {
  createDoctor, listAllDoctors, updateDoctor, toggleDoctorActive,
  searchDoctors, checkInDoctor, checkOutDoctor, attendanceToday
} from "../../lib/api";

function isDoctorPopulated(v: unknown): v is import("../../../types").Doctor {
  return !!v && typeof v === "object" && "name" in (v as any);
}

function safeDoctorName(doctorId: string | import("../../../types").Doctor): string {
  return isDoctorPopulated(doctorId) ? doctorId.name : String(doctorId);
}

function safeDoctorDept(doctorId: string | import("../../../types").Doctor): string {
  return isDoctorPopulated(doctorId) ? (doctorId.dept || "—") : "—";
}


export default function DoctorsReceptionPage() {
  const [loading, setLoading] = useState(false);

  // Add doctor form
  const [form, setForm] = useState<DoctorCreateInput>({
    name: "", dept: "", specialty: "", phone: "", email: "", fee: undefined, active: true
  });

  // Edit inline
  const [editing, setEditing] = useState<Doctor | null>(null);

  // Lists
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [attRows, setAttRows] = useState<DoctorAttendance[]>([]);

  // Search
  const [qName, setQName] = useState("");
  const [qDept, setQDept] = useState("");
  const [qSpec, setQSpec] = useState("");
  const [qPhone, setQPhone] = useState("");

  useEffect(() => {
    refreshLists();
  }, []);

  async function refreshLists() {
    setLoading(true);
    try {
      const { doctors } = await listAllDoctors();
      setDoctors(doctors);
      const { rows } = await attendanceToday();
      setAttRows(rows);
    } catch (e: any) {
      toast.error("Load failed", e?.message || "Unable to load doctors");
    } finally { setLoading(false); }
  }

  async function onCreate() {
    if (!form.name.trim() || !form.dept.trim()) {
      toast.warning("Name and Department are required"); return;
    }
    setLoading(true);
    try {
      const { doctor } = await createDoctor(form);
      toast.success("Doctor added", doctor.name);
      setForm({ name: "", dept: "", specialty: "", phone: "", email: "", fee: undefined, active: true });
      await refreshLists();
    } catch (e: any) {
      toast.error("Create failed", e?.message || "Unable to add doctor");
    } finally { setLoading(false); }
  }

  async function onEditSave() {
    if (!editing) return;
    setLoading(true);
    try {
      const { doctor } = await updateDoctor(editing._id, {
        name: editing.name, dept: editing.dept, specialty: editing.specialty,
        phone: editing.phone, email: editing.email, fee: editing.fee, active: editing.active
      });
      toast.success("Updated", doctor.name);
      setEditing(null);
      await refreshLists();
    } catch (e: any) {
      toast.error("Update failed", e?.message || "Unable to update");
    } finally { setLoading(false); }
  }

  async function onToggleActive(d: Doctor) {
    setLoading(true);
    try {
      const { doctor } = await toggleDoctorActive(d._id, !d.active);
      toast.success(doctor.active ? "Activated" : "Deactivated", doctor.name);
      await refreshLists();
    } catch (e: any) {
      toast.error("Toggle failed", e?.message || "Unable to toggle");
    } finally { setLoading(false); }
  }

  async function onSearch() {
    setLoading(true);
    try {
      const { doctors } = await searchDoctors({
        name: qName || undefined,
        dept: qDept || undefined,
        specialty: qSpec || undefined,
        phone: qPhone || undefined,
      });
      setDoctors(doctors);
      toast.success(`Found ${doctors.length} result(s)`);
    } catch (e: any) {
      toast.error("Search failed", e?.message || "Unable to search");
    } finally { setLoading(false); }
  }

  async function onCheckIn(id: string) {
    try {
      await checkInDoctor(id);
      toast.success("Checked in");
      await refreshLists();
    } catch (e: any) {
      toast.error("Check-in failed", e?.message || "Unable to check in");
    }
  }

  async function onCheckOut(id: string) {
    try {
      await checkOutDoctor(id);
      toast.success("Checked out");
      await refreshLists();
    } catch (e: any) {
      toast.error("Check-out failed", e?.message || "Unable to check out");
    }
  }

  const byIdAtt = useMemo(() => {
    const m = new Map<string, DoctorAttendance>();
    attRows.forEach((r) => {
      const id = typeof r.doctorId === "string" ? r.doctorId : r.doctorId._id;
      m.set(id, r);
    });
    return m;
  }, [attRows]);

  return (
    <section className="full-bleed">
      <div className="page-wrap">
        <h1 className={s.h1}>Reception · Doctors</h1>

        <div className={s.grid}>
          {/* Left: Add / Search / List */}
          <div className={s.card}>
            <div className={s.pill}>Add Doctor</div>
            <div className={s.split3}>
              <div>
                <label className={s.label}>Name</label>
                <input className={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={s.label}>Department</label>
                <input className={s.input} value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
              </div>
              <div>
                <label className={s.label}>Specialty</label>
                <input className={s.input} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
              </div>
            </div>
            <div className={s.split3}>
              <div>
                <label className={s.label}>Phone</label>
                <input className={s.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className={s.label}>Email</label>
                <input className={s.input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={s.label}>Consultation Fee (₹)</label>
                <input className={s.input} inputMode="decimal" value={form.fee ?? ""} onChange={(e) => setForm({ ...form, fee: e.target.value ? Number(e.target.value.replace(/[^\d.]/g, "")) : undefined })} />
              </div>
            </div>
            <div className={s.row} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active
              </label>
              <button className="btn btn-primary" onClick={onCreate} disabled={loading}>Add Doctor</button>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1rem 0" }} />

            <div className={s.pill}>Search</div>
            <div className={s.split3}>
              <input className={s.input} placeholder="Name" value={qName} onChange={(e) => setQName(e.target.value)} />
              <input className={s.input} placeholder="Department" value={qDept} onChange={(e) => setQDept(e.target.value)} />
              <input className={s.input} placeholder="Specialty" value={qSpec} onChange={(e) => setQSpec(e.target.value)} />
            </div>
            <div className={s.split2} style={{ marginTop: 8 }}>
              <input className={s.input} placeholder="Phone" value={qPhone} onChange={(e) => setQPhone(e.target.value)} />
              <button className="btn btn-outline-secondary" onClick={onSearch} disabled={loading}>Search</button>
            </div>

            <table className={s.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Dept</th><th>Specialty</th><th>Phone</th><th>Fee</th><th>Active</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => {
                  const att = byIdAtt.get(d._id);
                  const inNow = !!att?.checkInAt && !att?.checkOutAt;
                  return (
                    <tr key={d._id}>
                      <td>{d.name}</td>
                      <td>{d.dept}</td>
                      <td>{d.specialty || "—"}</td>
                      <td>{d.phone || "—"}</td>
                      <td>{d.fee != null ? `₹${d.fee}` : "—"}</td>
                      <td>{d.active ? "Yes" : "No"}</td>
                      <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn btn-outline-secondary" onClick={() => setEditing(d)}>Edit</button>
                        <button className="btn btn-outline-secondary" onClick={() => onToggleActive(d)}>{d.active ? "Deactivate" : "Activate"}</button>
                        {!inNow ? (
                          <button className="btn btn-primary" onClick={() => onCheckIn(d._id)}>Check-in</button>
                        ) : (
                          <button className="btn btn-outline-secondary" onClick={() => onCheckOut(d._id)}>Check-out</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right: Edit & Today Attendance */}
          <div className={s.card}>
            <div className={s.headerRow}>
              <div className={s.pill}>Edit Doctor</div>
              <button className="btn btn-outline-secondary" onClick={refreshLists}>Refresh</button>
            </div>
            {!editing ? (
              <div className="text-secondary">Select a doctor to edit.</div>
            ) : (
              <>
                <div className={s.split3}>
                  <div>
                    <label className={s.label}>Name</label>
                    <input className={s.input} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={s.label}>Department</label>
                    <input className={s.input} value={editing.dept} onChange={(e) => setEditing({ ...editing, dept: e.target.value })} />
                  </div>
                  <div>
                    <label className={s.label}>Specialty</label>
                    <input className={s.input} value={editing.specialty || ""} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} />
                  </div>
                </div>
                <div className={s.split3}>
                  <div>
                    <label className={s.label}>Phone</label>
                    <input className={s.input} value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className={s.label}>Email</label>
                    <input className={s.input} value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                  </div>
                  <div>
                    <label className={s.label}>Fee (₹)</label>
                    <input className={s.input} inputMode="decimal" value={editing.fee ?? ""} onChange={(e) => setEditing({ ...editing, fee: e.target.value ? Number(e.target.value.replace(/[^\d.]/g, "")) : null })} />
                  </div>
                </div>
                <div className={s.row} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                    Active
                  </label>
                  <button className="btn btn-primary" onClick={onEditSave} disabled={loading}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </>
            )}

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1rem 0" }} />

            <div className={s.pill}>Today’s Attendance</div>
            <table className={s.table}>
              <thead>
                <tr><th>Doctor</th><th>Dept</th><th>In</th><th>Out</th></tr>
              </thead>
              <tbody>
                {attRows.length === 0 ? (
                  <tr><td colSpan={4} className="text-secondary">No attendance yet.</td></tr>
                ) : attRows.map((r) => (
                  <tr key={r._id}>
                    <td>{safeDoctorName(r.doctorId)}</td>
                    <td>{safeDoctorDept(r.doctorId)}</td>
                    <td>{r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : "—"}</td>
                    <td>{r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : "—"}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
