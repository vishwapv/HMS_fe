// src/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MenuItem } from "../../../../types/index";
import { NestedMenu } from "./NestedHamburger";

const MENU: MenuItem[] = [
  {
    label: "Clinical",
    children: [
      { label: "OPD / Outpatient", href: "/opd" },
      { label: "Admissions", href: "/admissions" },
      { label: "Inpatient Rounds", href: "/ipd" },
      { label: "Pharmacy", href: "/pharmacy" },
      { label: "Laboratory", href: "/lab" },
      { label: "Radiology / PACS", href: "/pacs" },
    ],
  },
  {
    label: "Administration",
    children: [
      { label: "Appointments", href: "/appointments" },
      { label: "Queue & Triage", href: "/queue" },
      { label: "Bed Management", href: "/beds" },
      { label: "Billing & Insurance", href: "/billing" },
      { label: "Discharge", href: "/discharge" },
    ],
  },
  {
    label: "People",
    children: [
      { label: "Patients", href: "/patients" },
      { label: "Doctors", href: "/doctors" },
      { label: "Nurses", href: "/nurses" },
      { label: "Staff", href: "/staff" },
    ],
  },
  {
    label: "Insights",
    children: [
      { label: "Dashboards", href: "/analytics" },
      { label: "Reports", href: "/reports" },
      { label: "Audit Logs", href: "/audit" },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="SMH Home">
          <Image
            src="/smh-logo.jpeg"
            alt="SMH logo"
            width={36}
            height={36}
            className="brand-img"
            priority
          />
          <div>
            <div className="brand-text">SMH</div>
            <div className="brand-sub">Where Care Meets Excellence</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop" aria-label="Primary">
          {MENU.map((m) =>
            m.children ? (
              <div className="dropdown nav-item" key={m.label}>
                <span>{m.label}</span>
                <div className="dropdown-panel" role="menu">
                  <div className="dropdown-grid">
                    {m.children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href ?? "#"}
                        className="dropdown-link"
                      >
                        <span>{c.label}</span>
                        <span aria-hidden>›</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link className="nav-item" key={m.label} href={m.href ?? "#"}>
                {m.label}
              </Link>
            )
          )}
          <Link href="/login" className="btn btn-outline-secondary">
            Sign in
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={toggle}
        >
          <span />
        </button>
      </div>

      {/* Drawer + backdrop */}
      <div
        className={`drawer-backdrop ${open ? "open" : ""}`}
        onClick={close}
        aria-hidden={!open}
      />
      <aside
        id="mobile-drawer"
        className={`drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <div className="drawer-header">
          <div className="brand" style={{ gap: ".5rem" }}>
            <Image
              src="/smh-logo.jpeg"
              alt="SMH"
              width={28}
              height={28}
              className="brand-img"
            />
            <div className="brand-text">SMH Menu</div>
          </div>
          <button className="btn btn-ghost" onClick={close} aria-label="Close menu">
            ✕
          </button>
        </div>
        <div className="drawer-body">
          <NestedMenu items={MENU} onNavigate={close} />
          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem" }}>
            <Link href="/login" className="btn btn-primary" onClick={close}>
              Sign in
            </Link>
            <Link href="/contact" className="btn btn-ghost" onClick={close}>
              Contact
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
