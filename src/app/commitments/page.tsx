"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./commitments.module.css";
import type { Commitment, CommitmentStatus, DepartmentKey } from "../../../types";

type Role = "admin" | "receptionist" | "pharmacy" | null;
const DEPTS: Array<DepartmentKey | "OTHER"> = ["OPD", "IPD", "PHARMACY", "OTHER"];

function readRole(): Role {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)smh_role=([^;]+)/);
  return (m ? decodeURIComponent(m[1]) : null) as Role;
}

const LS_KEY = "smh_commitments";

export default function CommitmentsPage() {
  const role = readRole();
  const [rows, setRows] = useState<Commitment[]>([]);
  const [form, setForm] = useState({
    title: "",
    dept: "OPD" as Commitment["dept"],
    amount: "",
    dueOn: new Date().toISOString().slice(0, 10),
    status: "Planned" as CommitmentStatus,
    notes: "",
  });

  // Load saved (local) commitments for demo
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setRows(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(rows)); } catch {}
  }, [rows]);

  function addRow() {
    if (role !== "admin") {
      alert("Only admin can add commitments.");
      return;
    }
    const commit: Commitment = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      dept: form.dept,
      amount: Number(form.amount) || 0,
      dueOn: form.dueOn,
      status: form.status,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      createdBy: "admin",
    };
    if (!commit.title || !commit.amount) {
      alert("Title and Amount are required.");
      return;
    }
    setRows((r) => [commit, ...r]);
    setForm((f) => ({ ...f, title: "", amount: "", notes: "" }));
  }

  function remove(id: string) {
    setRows((r) => r.filter((x) => x.id !== id));
  }

  const totals = useMemo(() => {
    const committed = rows.reduce((a, r) => a + r.amount, 0);
    return { committed };
  }, [rows]);

  return (
    <section className={s.page}>
      <div className={s.wrap}>
        <h1 className={s.h1}>Commitments {role !== "admin" ? <span className="badge">View only</span> : null}</h1>

        <div className={s.grid}>
          <div className={s.card} aria-disabled={role !== "admin"}>
            <h3 className={s.h1} style={{ marginTop: 0 }}>New Commitment</h3>

            {role !== "admin" ? (
              <div className="card" style={{ padding: ".75rem 1rem", borderColor: "var(--warning)", background: "color-mix(in oklab, var(--warning), white 88%)", marginBottom: ".75rem" }}>
                Only admins can add or edit commitments.
              </div>
            ) : null}

            <div className={s.row}>
              <label className={s.label}>Title</label>
              <input
                className={s.input}
                placeholder="e.g., New MRI maintenance contract"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className={s.row} style={{ gridTemplateColumns: "1fr 1fr", display: "grid", gap: ".6rem" }}>
              <div>
                <label className={s.label}>Department</label>
                <select
                  className={s.select}
                  value={form.dept}
                  onChange={(e) => setForm({ ...form, dept: e.target.value as Commitment["dept"] })}
                >
                  {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={s.label}>Amount (₹)</label>
                <input
                  className={s.input}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="100"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            <div className={s.row} style={{ gridTemplateColumns: "1fr 1fr", display: "grid", gap: ".6rem" }}>
              <div>
                <label className={s.label}>Due on</label>
                <input
                  className={s.input}
                  type="date"
                  value={form.dueOn}
                  onChange={(e) => setForm({ ...form, dueOn: e.target.value })}
                />
              </div>
              <div>
                <label className={s.label}>Status</label>
                <select
                  className={s.select}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CommitmentStatus })}
                >
                  <option>Planned</option>
                  <option>Approved</option>
                  <option>Fulfilled</option>
                </select>
              </div>
            </div>

            <div className={s.row}>
              <label className={s.label}>Notes</label>
              <textarea
                className={s.textarea}
                placeholder="Optional details..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className={s.actions}>
              <button className="btn btn-primary" onClick={addRow} disabled={role !== "admin"}>Save Commitment</button>
              <button className="btn btn-ghost" onClick={() => setForm({ ...form, title: "", amount: "", notes: "" })}>Reset</button>
              <div style={{ marginLeft: "auto", color: "var(--secondary)" }}>
                Total committed: <strong>₹{totals.committed.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <h3 className={s.h1} style={{ marginTop: 0 }}>Commitments List</h3>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Dept</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={6} style={{ color: "var(--muted)", padding: "1rem .5rem" }}>No commitments yet.</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{r.dept}</td>
                    <td>₹{r.amount.toLocaleString("en-IN")}</td>
                    <td>{r.dueOn}</td>
                    <td><span className="badge">{r.status}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-ghost" onClick={() => remove(r.id)} disabled={role !== "admin"}>Delete</button>
                    </td>
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
