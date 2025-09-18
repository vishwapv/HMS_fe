// src/app/dashboard/pharmacy/page.tsx
"use client";

export default function PharmacyDashboard() {
  return (
    <section className="full-bleed">
      <div className="page-wrap">
        <h1 style={{fontSize:"clamp(26px,3vw,36px)", margin:"8px 0 16px"}}>Pharmacy · Analytics</h1>
        <div className="card" style={{padding:24}}>
          <div style={{fontSize:18, fontWeight:700, color:"var(--secondary)"}}>Coming Soon</div>
          <p className="text-secondary" style={{marginTop:8}}>
            We’re preparing inventory turnover, expiry alerts, purchase vs. dispense trends, and revenue mix.
          </p>
        </div>
      </div>
    </section>
  );
}
