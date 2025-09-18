// src/app/patients/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./patients.module.css";
import type {
  Patient,
  Visit,
  VisitType,
  Doctor,
  IDProofType,
} from "../../../types";
import {
  addVisit,
  getPatientByCard,
  getVisits,
  listDoctors,
  upsertPatient,
} from "../../lib/api";
import { toast } from "../../lib/toast";

const ID_PROOFS: IDProofType[] = [
  "Aadhaar",
  "PAN",
  "Passport",
  "DrivingLicense",
  "Other",
];
const GENDERS = ["Male", "Female", "Other"] as const;

/** Default form values to ensure required fields are always present */
const DEFAULT_FORM: Partial<Patient> = {
  cardNo: "",
  fullName: "",
  gender: "Male",
  dob: "",
  phone: "",
  idProofType: "Aadhaar",
  idProofNo: "",
  address: "",
};

function calcAge(dobISO: string | undefined): number | undefined {
  if (!dobISO) return undefined;
  const dob = new Date(dobISO);
  if (isNaN(dob.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const md = now.getMonth() - dob.getMonth();
  if (md < 0 || (md === 0 && now.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

type Errors = Partial<Record<keyof Patient, string>>;

export default function PatientsPage() {
  const [cardNo, setCardNo] = useState("");
  const [loading, setLoading] = useState(false);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [form, setForm] = useState<Partial<Patient>>({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState<Errors>({});

  const [visitForm, setVisitForm] = useState<{
    visitType: VisitType;
    doctorId: string;
    complaints: string;
  }>({
    visitType: "OPD",
    doctorId: "",
    complaints: "",
  });

  const derivedAge = useMemo(() => calcAge(form.dob), [form.dob]);

  /* ---------- load doctors ---------- */
  useEffect(() => {
    listDoctors()
      .then(({ doctors }) => setDoctors(doctors))
      .catch(() => {
        setDoctors([
          { _id: "D1", name: "Dr. A. Kumar", dept: "General Medicine", active: true },
          { _id: "D2", name: "Dr. P. Rao",   dept: "Orthopedics",      active: true },
          { _id: "D3", name: "Dr. S. Mehta", dept: "ENT",              active: true },
        ]);
      });
  }, []);

  /* ---------- clear for new patient ---------- */
  function clearForm() {
    setPatient(null);
    setForm({ ...DEFAULT_FORM });
    setCardNo("");
    setVisits([]);
    setErrors({});
    toast.info("Ready for new registration", "All fields cleared.");
  }

  /* ---------- find by card ---------- */
  async function findOrLoad() {
    const typed = cardNo.trim();
    if (!typed) return;
    setLoading(true);
    try {
      const { patient } = await getPatientByCard(typed);
      setPatient(patient);

      if (patient) {
        setForm({ ...DEFAULT_FORM, ...patient, cardNo: patient.cardNo });
        const { visits } = await getVisits(patient.cardNo);
        setVisits(visits);
        setErrors({});
        toast.info("Existing patient loaded", `Card ${patient.cardNo}`);
      } else {
        // Not found -> make the form ready for a fresh registration (EMPTY)
        setForm({ ...DEFAULT_FORM });
        setCardNo("");
        setVisits([]);
        setErrors({});
        toast.warning("No patient found", "Form cleared. Enter details to register.");
      }
    } catch (e: any) {
      setPatient(null);
      setForm({ ...DEFAULT_FORM });
      setCardNo("");
      setVisits([]);
      setErrors({});
      toast.error("Lookup failed", e?.message || "Unable to fetch patient.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- validation ---------- */
  function validate(p: Partial<Patient>): Errors {
    const e: Errors = {};
    if (!p.fullName || p.fullName.trim().length < 3) e.fullName = "Full name is required.";
    if (!p.gender || !GENDERS.includes(p.gender as any)) e.gender = "Select a gender.";
    if (!p.dob) e.dob = "DOB is required.";
    else {
      const d = new Date(p.dob);
      if (isNaN(d.getTime())) e.dob = "Invalid date.";
      else if (d > new Date()) e.dob = "DOB cannot be in the future.";
    }
    const phoneRe = /^\d{10}$/;
    if (!p.phone || !phoneRe.test(p.phone)) e.phone = "Enter 10-digit Indian mobile number.";
    // idProofNo is optional
    return e;
  }

  /* ---------- save patient ---------- */
  async function onSavePatient() {
    const payload: Partial<Patient> = { ...DEFAULT_FORM, ...form, age: derivedAge };
    const v = validate(payload);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      toast.warning("Please complete required fields", "Fix the highlighted inputs.");
      return;
    }

    setLoading(true);
    try {
      const { patient } = await upsertPatient(payload);
      setPatient(patient);
      setForm({ ...DEFAULT_FORM, ...patient });
      setErrors({});
      toast.success("Patient saved", `Card ${patient.cardNo}`);
      if (patient?.cardNo) {
        const { visits } = await getVisits(patient.cardNo);
        setVisits(visits);
      }
    } catch (e: any) {
      // If backend replied "PATIENT_EXISTS", show a specific copy
      const msg =
        e?.code === "PATIENT_EXISTS"
          ? "Patient already present in the database for this card number."
          : e?.message || "Unable to save patient.";
      toast.error("Save failed", msg);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- add visit ---------- */
  async function onAddVisit() {
    if (!patient?.cardNo) {
      toast.warning("Save patient first", "You need a card number to add a visit.");
      return;
    }
    if (!visitForm.doctorId) {
      toast.warning("Select doctor", "Please choose a consulting doctor.");
      return;
    }
    if (!visitForm.complaints.trim()) {
      toast.warning("Enter ailment details", "The ailment/complaints field is required.");
      return;
    }

    setLoading(true);
    try {
      const doc = doctors.find((d) => d._id === visitForm.doctorId);
      const payload = {
        patient: patient._id!,
        cardNo: patient.cardNo,
        visitType: visitForm.visitType,
        doctorId: visitForm.doctorId,
        doctorName: doc?.name,
        complaints: visitForm.complaints.trim(),
      };
      const { visit } = await addVisit(payload);
      setVisits((v) => [visit, ...v]);
      setVisitForm((v) => ({ ...v, complaints: "" }));
      toast.success("Visit added", `${visitForm.visitType} — ${doc?.name || "Doctor"}`);
    } catch (e: any) {
      toast.error("Visit save failed", e?.message || "Unable to save visit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`full-bleed ${s.page}`}>
      <div className="page-wrap">
        <div
          className={s.toolbar}
          style={{ justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}
        >
          <h1 className={s.h1}>Patients</h1>
          {patient ? <div className={s.pill}>Card: {patient.cardNo}</div> : null}
        </div>

        <div className={s.grid}>
          {/* Left: Registration / Edit + Visit form */}
          <div className={s.card}>
            <div className={s.headerRow}>
              <h2 className={s.h2}>Registration &amp; Triage</h2>
              {/* NEW / REFRESH BUTTON */}
              <button type="button" className="btn btn-ghost" onClick={clearForm} title="New / Clear">
                ↻ New Patient
              </button>
            </div>

            <div className={s.row}>
              <label className={s.label}>Swasthya Card Number</label>
              <div className={s.split2}>
                <input
                  className={s.input}
                  placeholder="Enter card if patient has one... e.g., SMH-20250917-000123"
                  value={cardNo}
                  onChange={(e) => setCardNo(e.target.value)}
                />
                <div className={s.actions}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={findOrLoad}
                    disabled={loading || !cardNo.trim()}
                  >
                    Find
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={clearForm}>
                    Clear
                  </button>
                </div>
              </div>
              <div className="text-secondary">
                Leave empty to create a new card (auto-generated on Save).
              </div>
            </div>

            <div className={s.split3}>
              <div>
                <label className={s.label}>Full Name</label>
                <input
                  className={`${s.input} ${errors.fullName ? s.invalid : ""}`}
                  value={form.fullName || ""}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && <div className={s.error}>{errors.fullName}</div>}
              </div>

              <div>
                <label className={s.label}>Gender</label>
                <select
                  className={`${s.select} ${errors.gender ? s.invalid : ""}`}
                  value={(form.gender as string) || "Male"}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                  aria-invalid={!!errors.gender}
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.gender && <div className={s.error}>{errors.gender}</div>}
              </div>

              <div>
                <label className={s.label}>DOB</label>
                <input
                  className={`${s.input} ${errors.dob ? s.invalid : ""}`}
                  type="date"
                  value={form.dob || ""}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  aria-invalid={!!errors.dob}
                />
                {errors.dob && <div className={s.error}>{errors.dob}</div>}
              </div>
            </div>

            <div className={s.split3}>
              <div>
                <label className={s.label}>Age (auto)</label>
                <input
                  className={s.input}
                  value={derivedAge ?? ""}
                  readOnly
                  placeholder="Auto from DOB"
                />
              </div>

              <div>
                <label className={s.label}>Phone (10-digit)</label>
                <input
                  className={`${s.input} ${errors.phone ? s.invalid : ""}`}
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d{10}"
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <div className={s.error}>{errors.phone}</div>}
              </div>

              <div>
                <label className={s.label}>Card No (if new, auto)</label>
                <input
                  className={s.input}
                  value={form.cardNo || ""}
                  onChange={(e) => setForm({ ...form, cardNo: e.target.value })}
                  placeholder="Leave blank for auto"
                />
              </div>
            </div>

            <div className={s.split3}>
              <div>
                <label className={s.label}>ID Proof Type</label>
                <select
                  className={s.select}
                  value={(form.idProofType as string) || "Aadhaar"}
                  onChange={(e) => setForm({ ...form, idProofType: e.target.value as any })}
                >
                  {ID_PROOFS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={s.label}>
                  ID Proof Number <span className="text-secondary">(optional)</span>
                </label>
                <input
                  className={s.input}
                  value={form.idProofNo || ""}
                  onChange={(e) => setForm({ ...form, idProofNo: e.target.value })}
                />
              </div>

              <div>
                <label className={s.label}>Address</label>
                <input
                  className={s.input}
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </div>

            <div className={s.toolbar}>
              <button className="btn btn-primary" onClick={onSavePatient} disabled={loading}>
                {patient ? "Save Changes" : "Save & Generate Card"}
              </button>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1rem 0" }} />

            <h2 className={s.h2}>New Visit</h2>
            <div className={s.split3}>
              <div>
                <label className={s.label}>Visit Type</label>
                <select
                  className={s.select}
                  value={visitForm.visitType}
                  onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value as any })}
                >
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                </select>
              </div>
              <div>
                <label className={s.label}>Doctor</label>
                <select
                  className={s.select}
                  value={visitForm.doctorId}
                  onChange={(e) => setVisitForm({ ...visitForm, doctorId: e.target.value })}
                >
                  <option value="">Select…</option>
                  {doctors.filter((d) => d.active).map((d) => (
                    <option key={d._id} value={d._id}>{d.name} · {d.dept}</option>
                  ))}
                </select>
              </div>
              <div />
            </div>

            <div className={s.row}>
              <label className={s.label}>Ailment / Complaints</label>
              <textarea
                className={s.textarea}
                value={visitForm.complaints}
                onChange={(e) => setVisitForm({ ...visitForm, complaints: e.target.value })}
              />
            </div>

            <div className={s.toolbar}>
              <button className="btn btn-outline-secondary" onClick={onAddVisit} disabled={loading || !patient}>
                Save Visit
              </button>
              {!patient ? (
                <span className="text-secondary">Save patient first to enable visit.</span>
              ) : null}
            </div>
          </div>

          {/* Right: History */}
          <div className={s.card}>
            <h2 className={s.h2}>History</h2>
            {patient ? (
              <div className={s.pill}>Visits: <strong style={{ marginLeft: 6 }}>{visits.length}</strong></div>
            ) : (
              <div className="text-secondary">Search a card or create a new patient to view history.</div>
            )}
            <div style={{ marginTop: ".75rem", display: "grid", gap: ".5rem" }}>
              {visits.length === 0 ? (
                patient ? <div className="text-secondary">No prior visits found.</div> : null
              ) : (
                visits.map((v) => (
                  <div key={v._id} className={s.historyItem}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong>{v.visitType}</strong>
                      <span className="text-secondary">
                        {v.createdAt ? new Date(v.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <div style={{ marginTop: 4 }} className="text-secondary">Doctor: {v.doctorName || "—"}</div>
                    <div style={{ marginTop: 4 }}>{v.complaints}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
