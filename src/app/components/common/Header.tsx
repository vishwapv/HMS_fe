// src/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MenuItem } from "../../../../types/index";
import { NestedMenu } from "./NestedHamburger";
import { useRouter, usePathname } from "next/navigation";

const hosptial_logo = require("../../../../public/WhatsApp Image 2025-08-30 at 10.16.31 PM (1).jpeg")

type Role = "admin" | "receptionist" | "pharmacy" | null;

/* ---------- helpers ---------- */
function readRole(): Role {
    if (typeof document === "undefined") return null;
    const m = document.cookie.match(/(?:^|;\s*)smh_role=([^;]+)/);
    const cookieRole = m ? decodeURIComponent(m[1]) : null;
    const lsRole = (localStorage.getItem("smh_role") as Role) || null;
    return (cookieRole as Role) || lsRole;
}
function clearSession() {
    if (typeof document !== "undefined") {
        document.cookie = "smh_role=; path=/; max-age=0";
    }
    if (typeof localStorage !== "undefined") {
        localStorage.removeItem("smh_role");
        localStorage.removeItem("smh_token");
        localStorage.removeItem("refreshToken");
    }
}

/* ---------- menus (3 areas only) ---------- */
const MENU: MenuItem[] = [
    {
        label: "Reception",
        children: [
            { label: "Dashboard", href: "/" },
            // { label: "OPD / Outpatient", href: "/opd" },
            // { label: "Admissions", href: "/admissions" },
            // { label: "Appointments", href: "/appointments" },
            // { label: "Queue & Triage", href: "/queue" },
            // { label: "Discharge", href: "/discharge" },
            { label: "Patients", href: "/patients" },
            { label: "Payments", href: "/payments" },
            { label: "Doctors", href: "/doctors" },
        ],
    },
    {
        label: "Pharmacy",
        children: [{ label: "Pharmacy Home", href: "/pharmacy" }],
    },
    {
        label: "Admin",
        children: [
            { label: "Dashboard", href: "/" },
            { label: "Payment Report", href: "/reports/payments" },
            { label: "Audit Logs", href: "/audit" },
            { label: "Reports", href: "/reports" },
            { label: "Commitments", href: "/commitments" },
            // (optional) also expose Commitments under Analytics for admins only in UI logic below
        ],
    },
];

const ROLE_GROUPS: Record<Exclude<Role, null>, Array<MenuItem["label"]>> = {
    admin: ["Reception", "Pharmacy", "Analytics"],
    receptionist: ["Reception"],
    pharmacy: ["Pharmacy"],
};

function menuForRole(menu: MenuItem[], role: Role): MenuItem[] {
    if (!role) return [];
    if (role === "admin") return menu;
    const visible = new Set(ROLE_GROUPS[role]);
    return menu.filter((g) => visible.has(g.label));
}

/* ---------- component ---------- */
export default function Header({ initialRole = null }: { initialRole?: Role }) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthPage = pathname === "/login";

    // seed from server (layout can pass cookie role); stays in sync via effects
    const [role, setRole] = useState<Role>(initialRole ?? null);
    const [open, setOpen] = useState(false);

    // update on mount
    useEffect(() => { setRole(readRole()); }, []);
    // update on route change (e.g., after login navigation)
    useEffect(() => { setRole(readRole()); }, [pathname]);
    // update when storage changes (multi-tab or same-tab writes)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (!e.key || ["smh_role", "smh_token", "refreshToken"].includes(e.key)) {
                setRole(readRole());
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);
    // update on focus (cookie changes)
    useEffect(() => {
        const onFocus = () => setRole(readRole());
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    const MENU_BY_ROLE = menuForRole(MENU, role);

    function onLogout() {
        clearSession();
        setRole(null);
        setOpen(false);
        router.replace("/login");
        router.refresh();
    }

    /* ------ brand-only header on /login ------ */
    if (isAuthPage) {
        return (
            <header className="site-header">
                <div className="header-inner">
                    <Link href="/" className="brand" aria-label="SMH Home">
                        <Image src={hosptial_logo} alt="SMH logo" width={36} height={36} className="brand-img" priority />
                        <div>
                            <div className="brand-text">SMH</div>
                            <div className="brand-sub">Where Care Meets Excellence</div>
                        </div>
                    </Link>
                </div>
            </header>
        );
    }

    /* ------ full header ------ */
    return (
        <header className="site-header">
            <div className="header-inner">
                <Link href="/" className="brand" aria-label="SMH Home">
                    <Image src={hosptial_logo} alt="SMH logo" width={36} height={36} className="brand-img" priority />
                    <div>
                        <div className="brand-text">SMH</div>
                        <div className="brand-sub">Where Care Meets Excellence</div>
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="nav-desktop" aria-label="Primary">
                    {MENU_BY_ROLE.map((group) =>
                        group.children ? (
                            <div className="dropdown nav-item" key={group.label}>
                                <span>{group.label}</span>
                                <div className="dropdown-panel" role="menu">
                                    <div className="dropdown-grid">
                                        {group.children?.map((c) => (
                                            <Link key={c.label} href={c.href ?? "#"} className="dropdown-link">
                                                <span>{c.label}</span>
                                                <span aria-hidden>›</span>
                                            </Link>
                                        ))}
                                        {/* Optional: show Commitments under Analytics only for admin */}
                                        {role === "admin" && group.label === "Analytics" ? (
                                            <Link href="/commitments" className="dropdown-link">
                                                <span>Commitments</span>
                                                <span aria-hidden>›</span>
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link className="nav-item" key={group.label} href={group.href ?? "#"}>
                                {group.label}
                            </Link>
                        )
                    )}

                    {/* ---- Admin-only Commitments button in header ---- */}
                    {/* {role === "admin" ? (
            <Link href="/commitments" className="btn btn-outline-secondary">
              Commitments
            </Link>
          ) : null} */}

                    {role ? (
                        <button className="btn btn-outline-secondary" onClick={onLogout}>
                            Logout
                        </button>
                    ) : null}
                </nav>

                {/* Mobile hamburger */}
                <button
                    className="hamburger"
                    aria-label="Open menu"
                    aria-expanded={open}
                    aria-controls="mobile-drawer"
                    onClick={() => setOpen((v) => !v)}
                >
                    <span />
                </button>
            </div>

            {/* Drawer + backdrop */}
            {/* <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} aria-hidden={!open} />
        <aside id="mobile-drawer" className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawer-header">
          <div className="brand" style={{ gap: ".5rem" }}>
            <Image src={hosptial_logo} alt="SMH" width={28} height={28} className="brand-img" />
            <div className="brand-text">SMH Menu</div>
          </div>
          <button className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <div className="drawer-body">
          <NestedMenu items={MENU_BY_ROLE} onNavigate={() => setOpen(false)} />

          <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            {role === "admin" ? (
              <Link href="/commitments" className="btn btn-primary" onClick={() => setOpen(false)}>
                Commitments
              </Link>
            ) : null}
            {role ? (
              <button className="btn btn-ghost" onClick={() => { setOpen(false); onLogout(); }}>
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </aside> */}
        </header>
    );
}
