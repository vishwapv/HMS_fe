// src/app/reports/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import s from "./page.module.css";
import { listDoctors, searchPayments, exportPaymentsPdf } from "../../../lib/api";
import { toast } from "../../../lib/toast";
import type { Doctor, PaymentRecord, PaymentSearchQuery } from "../../../../types";

function currency(n: number) { return `₹${(n||0).toLocaleString("en-IN")}`; }
function fmt(dt: string) { return new Date(dt).toLocaleString(); }

export default function AdminPaymentsReport() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totals, setTotals] = useState({
    day:0, week:0, month:0, year:0, overall:0, inRange:0
  });
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState<PaymentSearchQuery>({
    q: "",
    visitType: "ALL",
    method: "ALL",
    doctorId: "",
    from: "",
    to: "",
    page: 1,
    limit: 20,
    sort: "createdAt_desc",
  });

  useEffect(() => {
    listDoctors()
      .then(({ doctors }) => setDoctors(doctors || []))
      .catch(() => setDoctors([]));
  }, []);

  async function runSearch(goPage = 1) {
    setLoading(true);
    try {
      const payload = { ...q, page: goPage };
      const res = await searchPayments(payload);
      setRows(res.items);
      setPage(res.page);
      setPages(res.pages);
      setTotals(res.amountTotals);
    } catch (e: any) {
      toast.error("Failed to load payments", e?.message || "Try again");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runSearch(1); /* initial */ }, []);

  function resetFilters() {
    setQ({
      q: "",
      visitType: "ALL",
      method: "ALL",
      doctorId: "",
      from: "",
      to: "",
      page: 1,
      limit: 20,
      sort: "createdAt_desc",
    });
    setTimeout(() => runSearch(1), 0);
  }

  async function downloadPdf() {
    try {
      const blob = await exportPaymentsPdf(q);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "payments-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error("Export failed", e?.message || "Try again");
    }
  }

  return (
    <section className="full-bleed">
      <div className="page-wrap">
        <h1 className={s.h1}>Payments Report</h1>

        {/* Filters */}
        <div className={`${s.card} ${s.toolbar}`}>
          <input
            className={s.input}
            style={{minWidth:240}}
            placeholder="Search name/phone/id proof/cardNo…"
            value={q.q || ""}
            onChange={(e) => setQ({ ...q, q: e.target.value })}
          />
          <select className={s.select} value={q.visitType || "ALL"} onChange={(e)=>setQ({ ...q, visitType: e.target.value as any })}>
            <option value="ALL">All Types</option>
            <option value="OPD">OPD</option>
            <option value="IPD">IPD</option>
          </select>
          <select className={s.select} value={q.method || "ALL"} onChange={(e)=>setQ({ ...q, method: e.target.value as any })}>
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
          </select>
          <select className={s.select} value={q.doctorId || ""} onChange={(e)=>setQ({ ...q, doctorId: e.target.value })}>
            <option value="">All Doctors</option>
            {doctors.map(d => (<option key={d._id} value={d._id}>{d.name} · {d.dept}</option>))}
          </select>
          <input className={s.input} type="date" value={q.from || ""} onChange={(e)=>setQ({ ...q, from: e.target.value ? new Date(e.target.value).toISOString() : "" })}/>
          <input className={s.input} type="date" value={q.to ? q.to.substring(0,10) : ""} onChange={(e)=> {
            const v = e.target.value ? new Date(e.target.value) : null;
            // make "to" exclusive by adding +1 day at midnight
            if (v) { v.setDate(v.getDate()+1); setQ({ ...q, to: v.toISOString() }); } else setQ({ ...q, to: "" });
          }}/>
          <select className={s.select} value={q.sort} onChange={(e)=>setQ({ ...q, sort: e.target.value as any })}>
            <option value="createdAt_desc">Newest</option>
            <option value="createdAt_asc">Oldest</option>
            <option value="amount_desc">Amount ↓</option>
            <option value="amount_asc">Amount ↑</option>
          </select>

          <button className={`${s.btn} ${s.btnPrimary}`} onClick={()=>runSearch(1)} disabled={loading}>Search</button>
          <button className={s.btn} onClick={resetFilters} disabled={loading}>Reset</button>
          <div style={{flex:1}} />
          <button className={s.btn} onClick={downloadPdf} aria-label="Download PDF">
            ⬇️ Download PDF
          </button>
        </div>

        {/* KPIs */}
        <div className={`${s.card} ${s.kpis}`}>
          <div className={s.kpi}><div className="title">Day</div><div className="value">{currency(totals.day)}</div></div>
          <div className={s.kpi}><div className="title">Week</div><div className="value">{currency(totals.week)}</div></div>
          <div className={s.kpi}><div className="title">Month</div><div className="value">{currency(totals.month)}</div></div>
          <div className={s.kpi}><div className="title">Year</div><div className="value">{currency(totals.year)}</div></div>
          <div className={s.kpi}><div className="title">Overall</div><div className="value">{currency(totals.overall)}</div></div>
          <div className={s.kpi}><div className="title">Filtered</div><div className="value">{currency(totals.inRange)}</div></div>
        </div>

        {/* Table */}
        <div className={s.card}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Card</th>
                <th>Name</th>
                <th>Type</th>
                <th>Doctor</th>
                <th>Ailment</th>
                <th>Method</th>
                <th style={{textAlign:"right"}}>Amount</th>
                <th>LOS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9} className="text-secondary">No payments found.</td></tr>
              ) : rows.map(r => (
                <tr key={r._id}>
                  <td>{fmt(r.createdAt)}</td>
                  <td>{r.cardNo}</td>
                  <td>{r.patientName}</td>
                  <td>{r.visitType}</td>
                  <td>{r.doctorName || "—"}</td>
                  <td>{r.complaints || "—"}</td>
                  <td>{r.method}</td>
                  <td style={{textAlign:"right"}}>{currency(r.amount)}</td>
                  <td>{r.visitType === "IPD" ? (r.lengthOfStayDays ?? "—") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{display:"flex", justifyContent:"space-between", marginTop:10}}>
            <div className="text-secondary">Page {page} of {pages}</div>
            <div style={{display:"flex", gap:8}}>
              <button className={s.btn} disabled={page<=1 || loading} onClick={()=>runSearch(page-1)}>Prev</button>
              <button className={s.btn} disabled={page>=pages || loading} onClick={()=>runSearch(page+1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
