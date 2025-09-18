// src/app/dashboard/reception/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import s from "./page.module.css";
import { toast } from "../../../lib/toast";
import type { ReceptionAnalytics } from "../../../../types";
import { getReceptionAnalytics } from "../../../lib/api";

function currency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function ReceptionDashboard() {
  const [data, setData] = useState<ReceptionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getReceptionAnalytics();
        setData(res);
      } catch (e: any) {
        toast.error("Failed to load analytics", e?.message || "Please try later");
      } finally { setLoading(false); }
    })();
  }, []);

  const maxVisitCount = useMemo(() => {
    if (!data) return 0;
    return Math.max(...data.amountCollected.byVisitType.map(v => v.count), 1);
  }, [data]);

  const maxMethodAmt = useMemo(() => {
    if (!data) return 0;
    return Math.max(...data.amountCollected.byMethod.map(m => m.amount), 1);
  }, [data]);

  return (
    <section className="full-bleed">
      <div className="page-wrap">
        <h1 className={s.h1}>Reception · Analytics</h1>

        {!data ? (
          <div className="card" style={{padding:16}}>Loading…</div>
        ) : (
          <div className={s.grid}>
            {/* KPIs */}
            <div className={`${s.card} ${s.span3}`}>
              <div className={s.kpi}>
                <div className={s.kpiTitle}>Patients (Today)</div>
                <div className={s.kpiValue}>{data.patients.today}</div>
                <div className="text-secondary">Week {data.patients.week} · Month {data.patients.month}</div>
              </div>
            </div>
            <div className={`${s.card} ${s.span3}`}>
              <div className={s.kpi}>
                <div className={s.kpiTitle}>OPD / IPD (Month)</div>
                <div className={s.kpiValue}>{data.patients.opd} / {data.patients.ipd}</div>
                <div className="text-secondary">Year {data.patients.year} · Overall {data.patients.overall}</div>
              </div>
            </div>
            <div className={`${s.card} ${s.span3}`}>
              <div className={s.kpi}>
                <div className={s.kpiTitle}>Amount Collected (Today)</div>
                <div className={s.kpiValue}>{currency(data.amountCollected.today)}</div>
                <div className="text-secondary">Week {currency(data.amountCollected.week)}</div>
              </div>
            </div>
            <div className={`${s.card} ${s.span3}`}>
              <div className={s.kpi}>
                <div className={s.kpiTitle}>Amount (Month)</div>
                <div className={s.kpiValue}>{currency(data.amountCollected.month)}</div>
                <div className="text-secondary">Payment mix below</div>
              </div>
            </div>

            {/* Doctor leaderboard */}
            <div className={`${s.card} ${s.span6}`}>
              <h3 style={{marginTop:0}}>Top Doctors (by patients)</h3>
              <table className={s.table}>
                <thead>
                  <tr><th>Doctor</th><th style={{width:120, textAlign:"right"}}>Patients</th></tr>
                </thead>
                <tbody>
                  {data.topDoctors.map(d => (
                    <tr key={d.doctorId}>
                      <td>{d.name}</td>
                      <td style={{textAlign:"right"}}>{d.patients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* OPD vs IPD count bars */}
            <div className={`${s.card} ${s.span6}`}>
              <h3 style={{marginTop:0}}>OPD / IPD Count</h3>
              <div className={s.barRow}>
                <div className={s.barKey}>OPD</div>
                <div className={s.bar}><div className={s.barFill} style={{width: `${(data.amountCollected.byVisitType.find(v=>v.key==="OPD")?.count || 0) / maxVisitCount * 100}%`}} /></div>
                <div style={{width:80, textAlign:"right"}}>{data.patients.opd}</div>
              </div>
              <div className={s.barRow}>
                <div className={s.barKey}>IPD</div>
                <div className={s.bar}><div className={s.barFill} style={{width: `${(data.amountCollected.byVisitType.find(v=>v.key==="IPD")?.count || 0) / maxVisitCount * 100}%`}} /></div>
                <div style={{width:80, textAlign:"right"}}>{data.patients.ipd}</div>
              </div>
            </div>

            {/* By method money bars */}
            <div className={`${s.card} ${s.span12}`}>
              <h3 style={{marginTop:0}}>Amount by Method</h3>
              {data.amountCollected.byMethod.map(m => (
                <div key={m.key} className={s.barRow}>
                  <div className={s.barKey}>{m.key}</div>
                  <div className={s.bar}>
                    <div className={s.barFill} style={{width:`${(m.amount / maxMethodAmt) * 100}%`}} />
                  </div>
                  <div style={{width:120, textAlign:"right"}}>{currency(m.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
