// src/app/dashboard/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./page.module.css";
import { toast } from "../../../lib/toast";
import type { AdminAnalytics, Period } from "../../../../types";
import { getAdminAnalytics } from "../../../lib/api";

function currency(n: number) { return `₹${(n || 0).toLocaleString("en-IN")}`; }

const PERIODS: Period[] = ["day", "week", "month", "year", "overall"];

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(p: Period) {
    setLoading(true);
    try {
      const res = await getAdminAnalytics(p);
      setData(res);
    } catch (e: any) {
      toast.error("Failed to load admin analytics", e?.message || "Try later");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(period); }, [period]);

  const maxDept = useMemo(() => {
    if (!data) return 0;
    return Math.max(...(data.revenue.byDept?.map(d => d.amount) || [0,1]), 1);
  }, [data]);

  const maxMethod = useMemo(() => {
    if (!data) return 0;
    return Math.max(...(data.reception.amount.byMethod?.map(m => m.amount) || [0,1]), 1);
  }, [data]);

  return (
    <section className="full-bleed">
      <div className="page-wrap">
        <h1 className="h1" style={{fontSize:"clamp(26px,3vw,36px)", margin:"8px 0 8px"}}>
          Admin · Analytics
        </h1>

        {/* Filters */}
        <div className={s.filters} role="toolbar" aria-label="Time filters">
          {PERIODS.map(p => (
            <button
              key={p}
              className={s.fbtn}
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              disabled={loading}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
          {data?.range ? (
            <span className="text-secondary" style={{marginLeft:8}}>
              Range: {new Date(data.range.from).toLocaleString()}
              {data.range.to ? <> → {new Date(data.range.to).toLocaleString()}</> : " → Now"}
            </span>
          ) : null}
        </div>

        {!data ? (
          <div className="card" style={{padding:16}}>Loading…</div>
        ) : (
          <div className="grid" style={{display:"grid", gridTemplateColumns:"repeat(12,1fr)", gap:16}}>
            {/* KPI row: Revenue / Costs / Investments / Profit */}
            <div className="card" style={{gridColumn:"span 3", padding:16}}>
              <div className="text-secondary" style={{fontWeight:700}}>Revenue ({period})</div>
              <div style={{fontSize:28, fontWeight:800, color:"var(--smh-teal-700)"}}>
                {currency(data.revenue.total)}
              </div>
            </div>
            <div className="card" style={{gridColumn:"span 3", padding:16}}>
              <div className="text-secondary" style={{fontWeight:700}}>Costs ({period})</div>
              <div style={{fontSize:28, fontWeight:800}}>{currency(data.costs.total)}</div>
            </div>
            <div className="card" style={{gridColumn:"span 3", padding:16}}>
              <div className="text-secondary" style={{fontWeight:700}}>Investments ({period})</div>
              <div style={{fontSize:28, fontWeight:800}}>{currency(data.investments)}</div>
            </div>
            <div className="card" style={{gridColumn:"span 3", padding:16}}>
              <div className="text-secondary" style={{fontWeight:700}}>Profit ({period})</div>
              <div style={{fontSize:28, fontWeight:800, color:"var(--smh-teal-700)"}}>
                {currency(data.profit)}
              </div>
            </div>

            {/* Revenue by Department */}
            <div className="card" style={{gridColumn:"span 6", padding:16}}>
              <h3 style={{marginTop:0}}>Revenue by Department</h3>
              {(data.revenue.byDept || []).map(d => (
                <div key={d.key} style={{display:"flex",alignItems:"center",gap:10, margin:"6px 0"}}>
                  <div style={{width:120, color:"var(--secondary)", fontWeight:700}}>{d.key}</div>
                  <div style={{flex:1, height:12, borderRadius:999, background:"var(--smh-gray-100)", overflow:"hidden"}}>
                    <div style={{height:"100%", background:"var(--primary)", width:`${(d.amount/maxDept)*100}%`}} />
                  </div>
                  <div style={{width:130, textAlign:"right"}}>{currency(d.amount)}</div>
                </div>
              ))}
              {(!data.revenue.byDept || data.revenue.byDept.length === 0) && (
                <div className="text-secondary">No data.</div>
              )}
            </div>

            {/* Cost breakdown */}
            <div className="card" style={{gridColumn:"span 6", padding:16}}>
              <h3 style={{marginTop:0}}>Cost Breakdown</h3>
              <table style={{width:"100%", borderCollapse:"collapse"}}>
                <tbody>
                  <tr><td>Salaries</td><td style={{textAlign:"right"}}>{currency(data.costs.salaries)}</td></tr>
                  <tr><td>Consumables</td><td style={{textAlign:"right"}}>{currency(data.costs.consumables)}</td></tr>
                  <tr><td>Maintenance</td><td style={{textAlign:"right"}}>{currency(data.costs.maintenance)}</td></tr>
                  <tr><td>Utilities</td><td style={{textAlign:"right"}}>{currency(data.costs.utilities)}</td></tr>
                  <tr><td>Misc</td><td style={{textAlign:"right"}}>{currency(data.costs.misc)}</td></tr>
                  <tr><th>Total</th><th style={{textAlign:"right"}}>{currency(data.costs.total)}</th></tr>
                </tbody>
              </table>
            </div>

            {/* --- Reception details for Admin --- */}
            <div className="card" style={{gridColumn:"span 4", padding:16}}>
              <h3 style={{marginTop:0}}>Patients ({period})</h3>
              <div className="text-secondary">New registrations</div>
              <div style={{fontSize:28, fontWeight:800, color:"var(--smh-teal-700)"}}>
                {data.reception.patients.total}
              </div>
              <div className="text-secondary" style={{marginTop:8}}>
                OPD: <b>{data.reception.patients.opd}</b> &nbsp;·&nbsp; IPD: <b>{data.reception.patients.ipd}</b>
              </div>
            </div>

            <div className="card" style={{gridColumn:"span 4", padding:16}}>
              <h3 style={{marginTop:0}}>Amount by Method ({period})</h3>
              {(data.reception.amount.byMethod || []).map(m => (
                <div key={m.key} style={{display:"flex",alignItems:"center",gap:10, margin:"6px 0"}}>
                  <div style={{width:120, color:"var(--secondary)", fontWeight:700}}>{m.key}</div>
                  <div style={{flex:1, height:12, borderRadius:999, background:"var(--smh-gray-100)", overflow:"hidden"}}>
                    <div style={{height:"100%", background:"var(--primary)", width:`${(m.amount/maxMethod)*100}%`}} />
                  </div>
                  <div style={{width:130, textAlign:"right"}}>{currency(m.amount)}</div>
                </div>
              ))}
              {(!data.reception.amount.byMethod || data.reception.amount.byMethod.length === 0) && (
                <div className="text-secondary">No data.</div>
              )}
            </div>

            <div className="card" style={{gridColumn:"span 4", padding:16}}>
              <h3 style={{marginTop:0}}>Top Doctors ({period})</h3>
              <table style={{width:"100%", borderCollapse:"collapse"}}>
                <thead>
                  <tr><th style={{textAlign:"left"}}>Doctor</th><th style={{textAlign:"right"}}>Patients</th></tr>
                </thead>
                <tbody>
                  {(data.reception.topDoctors || []).map(d => (
                    <tr key={d.doctorId}>
                      <td>{d.name}</td>
                      <td style={{textAlign:"right"}}>{d.patients}</td>
                    </tr>
                  ))}
                  {(!data.reception.topDoctors || data.reception.topDoctors.length === 0) && (
                    <tr><td className="text-secondary" colSpan={2}>No data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reception totals */}
            <div className="card" style={{gridColumn:"span 12", padding:16}}>
              <div className="text-secondary" style={{fontWeight:700}}>Reception Amount ({period})</div>
              <div style={{fontSize:24, fontWeight:800}}>{currency(data.reception.amount.total)}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
