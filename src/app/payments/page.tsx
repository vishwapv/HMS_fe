// src/app/reception/payments/page.tsx
"use client";

import { useMemo, useState } from "react";
import s from "./page.module.css";
import { toast } from "../../lib/toast";
import type { Payment, PaymentMethod, PaymentPreview } from "../../../types";
import { paymentSearch, paymentPreview, createPayment } from "../../lib/api";

const METHODS: PaymentMethod[] = ["CASH", "CARD", "UPI"];
const ID_TYPES = ["Aadhaar","PAN","Passport","DrivingLicense","Other"] as const;

export default function ReceptionPaymentsPage() {
  // Search state
  const [mode, setMode] = useState<"card"|"name"|"phone"|"id">("card");
  const [cardNo, setCardNo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [idType, setIdType] = useState<typeof ID_TYPES[number]>("Aadhaar");
  const [idNo, setIdNo] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PaymentPreview[]>([]);
  const [preview, setPreview] = useState<PaymentPreview | null>(null);

  // Payment form
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const canPay = useMemo(
    () => !!preview && Number(amount) > 0,
    [preview, amount]
  );

  function resetAll() {
    setMode("card");
    setCardNo("");
    setName("");
    setPhone("");
    setIdType("Aadhaar");
    setIdNo("");
    setResults([]);
    setPreview(null);
    setMethod("CASH");
    setAmount("");
    setUpiId("");
    setNotes("");
    toast.success("Ready for a new payment");
  }

  async function onSearch() {
    setLoading(true);
    setResults([]);
    setPreview(null);
    try {
      if (mode === "card") {
        if (!cardNo.trim()) { toast.warning("Enter Card No"); return; }
        const { preview } = await paymentPreview(cardNo.trim());
        setPreview(preview);
        toast.success("Patient found", `${preview.patientName} (${preview.cardNo})`);
      } else {
        const body: any = {};
        if (mode === "name")  body.name = name.trim();
        if (mode === "phone") body.phone = phone.trim();
        if (mode === "id")    { body.idProofType = idType; body.idProofNo = idNo.trim(); }

        if (Object.values(body).every(v => !v)) {
          toast.warning("Enter a value to search"); return;
        }

        const { results } = await paymentSearch(body);
        setResults(results);
        if (results.length === 0) {
          toast.warning("No matches found");
        } else {
          toast.success(`Found ${results.length} result(s)`);
        }
      }
    } catch (e: any) {
      toast.error("Search failed", e?.message || "Unable to search");
    } finally { setLoading(false); }
  }

  async function onSelectRow(p: PaymentPreview) {
    setPreview(p);
    setResults([]);
    setMode("card");
    setCardNo(p.cardNo);
  }

  async function onPay() {
    if (!preview) return;
    const payload: Payment = {
      cardNo: preview.cardNo,
      patientId: preview.patientId,
      patientName: preview.patientName,
      visitId: preview.visitId || undefined,
      visitType: preview.visitType || undefined,
      doctorId: preview.doctorId || undefined,
      doctorName: preview.doctorName || undefined,
      method,
      amount: Number(amount),
      upiId: method === "UPI" ? (upiId || "") : "",
      notes,
    };

    if (payload.amount <= 0) {
      toast.warning("Enter a valid amount");
      return;
    }
    if (method === "UPI" && upiId && !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
      toast.warning("UPI ID format is invalid");
      return;
    }

    setLoading(true);
    try {
      const { payment } = await createPayment(payload);
      toast.success("Payment recorded", `₹${payment.amount.toFixed(2)} via ${payment.method}`);
      // reset amount/notes, keep preview for another charge if needed
      setAmount("");
      setUpiId("");
      setNotes("");
    } catch (e: any) {
      toast.error("Payment failed", e?.message || "Unable to record payment");
    } finally { setLoading(false); }
  }

  return (
    <section className="full-bleed">
      <div className="page-wrap">
        <div className={s.headerRow}>
          <h1 className={s.h1}>Reception · Payments</h1>
          <div className={s.btnRow}>
            <button className="btn btn-outline-secondary" onClick={resetAll}>Refresh</button>
          </div>
        </div>

        <div className={s.grid}>
          {/* Left: Search & Pay */}
          <div className={s.card}>
            <div className={s.headerRow} style={{gap:8}}>
              <div className={s.pill}>Search</div>
              <div className={s.btnRow}>
                <label><input type="radio" name="mode" checked={mode==="card"}  onChange={()=>setMode("card")}  /> Card</label>
                <label><input type="radio" name="mode" checked={mode==="name"}  onChange={()=>setMode("name")}  /> Name</label>
                <label><input type="radio" name="mode" checked={mode==="phone"} onChange={()=>setMode("phone")} /> Phone</label>
                <label><input type="radio" name="mode" checked={mode==="id"}    onChange={()=>setMode("id")}    /> ID Proof</label>
              </div>
            </div>

            {/* Search inputs by mode */}
            {mode === "card" && (
              <div className={s.row}>
                <label className={s.label}>Card Number</label>
                <div className={s.split2}>
                  <input
                    className={s.input}
                    placeholder="e.g., SMH-01"
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" onClick={onSearch} disabled={loading}>
                    Find
                  </button>
                </div>
              </div>
            )}

            {mode === "name" && (
              <div className={s.row}>
                <label className={s.label}>Name (partial allowed)</label>
                <div className={s.split2}>
                  <input
                    className={s.input}
                    placeholder="Patient name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" onClick={onSearch} disabled={loading}>
                    Search
                  </button>
                </div>
              </div>
            )}

            {mode === "phone" && (
              <div className={s.row}>
                <label className={s.label}>Phone</label>
                <div className={s.split2}>
                  <input
                    className={s.input}
                    placeholder="10-digit or last 4"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  />
                  <button className="btn btn-outline-secondary" onClick={onSearch} disabled={loading}>
                    Search
                  </button>
                </div>
              </div>
            )}

            {mode === "id" && (
              <div className={s.row}>
                <label className={s.label}>ID Proof</label>
                <div className={s.split3}>
                  <select className={s.select} value={idType} onChange={(e)=>setIdType(e.target.value as any)}>
                    {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    className={s.input}
                    placeholder="ID number (partial ok)"
                    value={idNo}
                    onChange={(e)=>setIdNo(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" onClick={onSearch} disabled={loading}>
                    Search
                  </button>
                </div>
              </div>
            )}

            {/* Results table (for name/phone/id) */}
            {results.length > 0 && (
              <div className={s.row}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Card</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Latest Visit</th>
                      <th>Doctor</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.cardNo}>
                        <td>{r.cardNo}</td>
                        <td>{r.patientName}</td>
                        <td>{r.phone}</td>
                        <td>{r.visitType || "—"}</td>
                        <td>{r.doctorName || "—"}</td>
                        <td>
                          <button className="btn btn-primary" onClick={()=>onSelectRow(r)}>Select</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1rem 0" }} />

            {/* Payment block */}
            <div className={s.row}>
              <label className={s.label}>Payment Method</label>
              <div className={s.btnRow}>
                {METHODS.map((m) => (
                  <label key={m} style={{ display: "inline-flex", alignItems: "center", gap: ".45rem" }}>
                    <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            {method === "UPI" ? (
              <div className={s.row}>
                <label className={s.label}>UPI ID <span className="text-secondary">(optional)</span></label>
                <input
                  className={s.input}
                  placeholder="name@bank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            ) : null}

            <div className={s.split3}>
              <div>
                <label className={s.label}>Amount (₹)</label>
                <input
                  className={s.input}
                  placeholder="0.00"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                />
              </div>
              <div>
                <label className={s.label}>Notes</label>
                <input
                  className={s.input}
                  placeholder="optional"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div />
            </div>

            <div className={s.row} style={{ marginTop: "14px" }}>
              <button className="btn btn-primary" onClick={onPay} disabled={loading || !canPay}>
                Record Payment
              </button>
              {!preview ? <span className="text-secondary" style={{marginLeft:8}}>Select a patient first.</span> : null}
            </div>
            <div className="subtle" style={{ marginTop: "6px" }}>
              * Records payment only; online gateway can be integrated later.
            </div>
          </div>

          {/* Right: Preview */}
          <div className={s.card}>
            <div className={s.headerRow}>
              <h3 style={{ margin: 0 }}>Patient Summary</h3>
              {preview ? <div className={s.pill}>Card: {preview.cardNo}</div> : null}
            </div>

            {!preview ? (
              <div className="text-secondary">Search and select a patient to view details.</div>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                <div><strong>{preview.patientName}</strong></div>
                <div className="text-secondary">
                  {preview.gender} · {preview.age ? `${preview.age} yrs` : ""} · {preview.phone}
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

                <div style={{ display: "grid", gap: 4 }}>
                  <div className="text-secondary">Latest Visit</div>
                  <div><strong>{preview.visitType || "—"}</strong></div>
                  <div className="text-secondary">Doctor: {preview.doctorName || "—"}</div>
                  <div>{preview.complaints || <span className="text-secondary">No complaints noted</span>}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
