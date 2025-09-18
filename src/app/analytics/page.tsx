"use client";

import { useMemo, useState } from "react";
import s from "./analytics.module.css";
import type {
  Timeframe,
  KPI,
  DeptSeries,
  RevenueRow,
  RevenueSummary,
} from "../../../types/index";

/* ----------------------- Static demo data ----------------------- */
const SERIES: Record<Timeframe, DeptSeries[]> = {
  day: [
    { dept: "OPD", points: [ {x:"08:00",y:18},{x:"10:00",y:32},{x:"12:00",y:28},{x:"14:00",y:35},{x:"16:00",y:22} ] },
    { dept: "IPD", points: [ {x:"08:00",y:6},{x:"10:00",y:8},{x:"12:00",y:9},{x:"14:00",y:7},{x:"16:00",y:6} ] },
    { dept: "PHARMACY", points: [ {x:"08:00",y:22},{x:"10:00",y:30},{x:"12:00",y:26},{x:"14:00",y:24},{x:"16:00",y:18} ] },
  ],
  week: [
    { dept: "OPD", points: [ {x:"Mon",y:130},{x:"Tue",y:148},{x:"Wed",y:152},{x:"Thu",y:140},{x:"Fri",y:168},{x:"Sat",y:120},{x:"Sun",y:60} ] },
    { dept: "IPD", points: [ {x:"Mon",y:38},{x:"Tue",y:42},{x:"Wed",y:45},{x:"Thu",y:41},{x:"Fri",y:40},{x:"Sat",y:30},{x:"Sun",y:18} ] },
    { dept: "PHARMACY", points: [ {x:"Mon",y:210},{x:"Tue",y:225},{x:"Wed",y:240},{x:"Thu",y:230},{x:"Fri",y:260},{x:"Sat",y:180},{x:"Sun",y:90} ] },
  ],
  month: [
    { dept: "OPD", points: [ {x:"W1",y:780},{x:"W2",y:820},{x:"W3",y:860},{x:"W4",y:910} ] },
    { dept: "IPD", points: [ {x:"W1",y:220},{x:"W2",y:235},{x:"W3",y:240},{x:"W4",y:250} ] },
    { dept: "PHARMACY", points: [ {x:"W1",y:1300},{x:"W2",y:1380},{x:"W3",y:1420},{x:"W4",y:1500} ] },
  ],
};

const REVENUE: Record<Timeframe, RevenueRow[]> = {
  day: [
    { label: "OPD", committed: 120000, realized: 110000, expense: 40000 },
    { label: "IPD", committed: 80000, realized: 90000, expense: 30000 },
    { label: "Pharmacy", committed: 150000, realized: 160000, expense: 90000 },
  ],
  week: [
    { label: "OPD", committed: 700000, realized: 740000, expense: 290000 },
    { label: "IPD", committed: 520000, realized: 500000, expense: 210000 },
    { label: "Pharmacy", committed: 980000, realized: 1050000, expense: 630000 },
  ],
  month: [
    { label: "OPD", committed: 3000000, realized: 3180000, expense: 1250000 },
    { label: "IPD", committed: 2100000, realized: 2050000, expense: 870000 },
    { label: "Pharmacy", committed: 4250000, realized: 4480000, expense: 2670000 },
  ],
};

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ------------- simple SVG charts (scale with container width) ------------- */
function LineChart({ series, stroke }: { series: { x: string; y: number }[]; stroke: string; }) {
  const padding = { t: 10, r: 10, b: 22, l: 30 };
  const W = 800, H = 360;
  const xs = series.map(p=>p.x), ys = series.map(p=>p.y);
  const minY = 0, maxY = Math.max(...ys) * 1.15;
  const xStep = (W - padding.l - padding.r) / Math.max(1, xs.length - 1);
  const points = series.map((p,i)=> {
    const x = padding.l + i * xStep;
    const y = padding.t + (H - padding.t - padding.b) * (1 - (p.y - minY) / (maxY - minY));
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.chart}>
      {Array.from({ length: 4 }).map((_, i) => {
        const y = padding.t + ((H - padding.t - padding.b) / 3) * i;
        return <line key={i} x1={padding.l} x2={W - padding.r} y1={y} y2={y} stroke="var(--smh-gray-200)" />;
      })}
      <polyline fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" points={points.join(" ")} />
      {series.map((p,i)=> {
        const x = padding.l + i * xStep;
        const y = padding.t + (H - padding.t - padding.b) * (1 - (p.y - minY) / (maxY - minY));
        return <circle key={i} cx={x} cy={y} r="4" fill={stroke} />;
      })}
      {xs.map((label,i)=> {
        const x = padding.l + i * xStep;
        return <text key={i} x={x} y={H-6} fontSize="12" textAnchor="middle" fill="var(--smh-gray-700)">{label}</text>;
      })}
    </svg>
  );
}

function GroupBar({ rows }: { rows: RevenueRow[] }) {
  const padding = { t: 10, r: 10, b: 26, l: 34 };
  const W = 800, H = 360;
  const groups = rows.length, barW = 22, gap = 24, groupW = barW*3 + gap;
  const maxVal = Math.max(...rows.flatMap(r=>[r.committed,r.realized,r.expense])) * 1.15;
  const xStart = padding.l + (W - padding.l - padding.r - groups * groupW) / 2;
  const yScale = (v:number)=> padding.t + (H - padding.t - padding.b) * (1 - v / maxVal);
  const colors = { committed:"var(--smh-gray-700)", realized:"var(--primary)", expense:"var(--smh-teal-300)" } as const;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.chart}>
      {Array.from({ length: 4 }).map((_, i) => {
        const y = padding.t + ((H - padding.t - padding.b) / 3) * i;
        return <line key={i} x1={padding.l} x2={W - padding.r} y1={y} y2={y} stroke="var(--smh-gray-200)" />;
      })}
      {rows.map((r, gi) => {
        const gx = xStart + gi * groupW;
        const c = { v: r.committed, x: gx,            color: colors.committed };
        const a = { v: r.realized,  x: gx + barW,     color: colors.realized };
        const e = { v: r.expense,   x: gx + barW * 2, color: colors.expense  };
        return (
          <g key={r.label}>
            {[c,a,e].map((b, bi) => {
              const y = yScale(b.v), h = H - padding.b - y;
              return <rect key={bi} x={b.x} y={y} width={barW-2} height={h} rx="6" fill={b.color} />;
            })}
            <text x={gx + barW} y={H-6} fontSize="12" textAnchor="middle" fill="var(--smh-gray-700)">{r.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ----------------------- Page ----------------------- */
export default function AnalyticsPage() {
  const [tf, setTf] = useState<Timeframe>("week");

  const kpis: KPI[] = useMemo(() => {
    const s = SERIES[tf];
    const totals = s.map(dep => dep.points.reduce((acc, p) => acc + p.y, 0));
    const totalVisits = totals.reduce((a, b) => a + b, 0);
    const opd = totals[0] ?? 0, ipd = totals[1] ?? 0, ph = totals[2] ?? 0;

    const rev = REVENUE[tf];
    const realized = rev.reduce((a, r) => a + r.realized, 0);
    const expense  = rev.reduce((a, r) => a + r.expense, 0);
    const profit   = realized - expense;

    return [
      { label: "Total Visits", value: totalVisits, unit: "visits", delta: +6 },
      { label: "OPD Volume", value: opd, unit: "visits", delta: +3 },
      { label: "IPD Admissions", value: ipd, unit: "adms", delta: -1 },
      { label: "Pharmacy Bills", value: ph, unit: "bills", delta: +8 },
      { label: "Revenue (Realized)", value: realized, unit: "₹", delta: +5 },
      { label: "Profit", value: profit, unit: "₹", delta: +2 },
    ];
  }, [tf]);

  const revSummary: RevenueSummary = useMemo(() => {
    const rows = REVENUE[tf];
    const totalCommitted = rows.reduce((a, r) => a + r.committed, 0);
    const totalRealized  = rows.reduce((a, r) => a + r.realized,  0);
    const totalExpense   = rows.reduce((a, r) => a + r.expense,   0);
    const profit = totalRealized - totalExpense;
    const marginPct = totalRealized ? Math.round((profit / totalRealized) * 100) : 0;
    return { totalCommitted, totalRealized, totalExpense, profit, marginPct };
  }, [tf]);

  const series = SERIES[tf];

  return (
    <section className={s.page}>
      <div className={s.wrap}>
        <div className={s.headerRow}>
          <div>
            <h1 className={s.title}>Hospital Analytics</h1>
            <div className="text-secondary">Overall performance & revenue — {tf.toUpperCase()}</div>
          </div>
          <div className={s.tabs} role="tablist" aria-label="timeframe">
            {(["day","week","month"] as Timeframe[]).map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={tf === t}
                className={`${s.tab} ${tf === t ? s.tabActive : ""}`}
                onClick={() => setTf(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className={s.kpis}>
          {kpis.map((k) => (
            <div className={s.kpi} key={k.label}>
              <div className={s.kpiLabel}>{k.label}</div>
              <div className={s.kpiValue}>
                {k.unit === "₹" ? formatINR(k.value) : k.value.toLocaleString()}
              </div>
              {typeof k.delta === "number" ? (
                <div className={`${s.kpiDelta} ${k.delta >= 0 ? s.deltaUp : s.deltaDown}`}>
                  {k.delta >= 0 ? "▲" : "▼"} {Math.abs(k.delta)}% vs prev.
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className={s.grid}>
          <div className={s.card}>
            <h3 className={s.cardTitle}>Department Volume</h3>
            <LineChart series={series.find(d => d.dept === "OPD")!.points} stroke={"var(--primary)"} />
            <div className={s.legend}>
              <span><i className={`${s.dot} ${s.cPrimary}`} />OPD</span>
              <span><i className={s.dot} style={{ background: "var(--smh-teal-300)" }} />IPD</span>
              <span><i className={s.dot} style={{ background: "var(--smh-gray-700)" }} />Pharmacy</span>
            </div>
          </div>

          <div className={s.card}>
            <h3 className={s.cardTitle}>Revenue (Committed vs Realized vs Expense)</h3>
            <GroupBar rows={REVENUE[tf]} />
            <div className={s.revSummary}>
              <div className={s.revPill}>Committed: {formatINR(revSummary.totalCommitted)}</div>
              <div className={s.revPill}>Realized: {formatINR(revSummary.totalRealized)}</div>
              <div className={s.revPill}>Expense: {formatINR(revSummary.totalExpense)}</div>
              <div className={s.revPill}>Profit: {formatINR(revSummary.profit)} ({revSummary.marginPct}%)</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1rem", padding: "1rem" }}>
          <h3 className={s.cardTitle}>IPD & Pharmacy Trend</h3>
          <div style={{ position: "relative" }}>
            <LineChart series={series.find(d => d.dept === "IPD")!.points} stroke={"var(--smh-teal-300)"} />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <LineChart series={series.find(d => d.dept === "PHARMACY")!.points} stroke={"var(--smh-gray-700)"} />
            </div>
          </div>
          <div className={s.legend}>
            <span><i className={s.dot} style={{ background: "var(--smh-teal-300)" }} />IPD</span>
            <span><i className={s.dot} style={{ background: "var(--smh-gray-700)" }} />Pharmacy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
