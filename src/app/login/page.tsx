"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login, setSession } from "../../lib/api";
import s from "./login.module.css";
const hosptial_logo = require("../../../public/WhatsApp Image 2025-08-30 at 10.16.31 PM (1).jpeg")


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      // DO NOT hash on client; backend does sha256
      const res = await login({ email, password }); // posts to Endpoints.login
      const role = res.role || "admin"; // backend returns role
      if (remember) setSession(role, res.token, res.refreshToken);
      router.push("/");
    } catch (e: any) {
      setErr(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={s.authPage}>
      <div className={s.card}>
        <div className={s.brandRow}>
          <Image
            src={hosptial_logo}
            alt="SMH"
            width={40}
            height={40}
            className={s.brandImg}
          />
          <div className={s.brandTitle}>SMH</div>
        </div>

        <h2 className={s.title}>Welcome back</h2>
        <p className={s.helper}>Sign in to continue to your workspace.</p>

        {err ? (
          <div
            className="card"
            style={{
              padding: ".75rem 1rem",
              marginTop: ".75rem",
              borderColor: "var(--danger)",
              color: "var(--danger)",
              background: "color-mix(in oklab, var(--danger), white 90%)",
            }}
          >
            {err}
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ marginTop: "1rem", display: "grid", gap: ".85rem" }}>
          <div>
            <label htmlFor="email" className={s.helper} style={{ display: "block", marginBottom: ".35rem" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={s.input}
              placeholder="you@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className={s.helper} style={{ display: "block", marginBottom: ".35rem" }}>
              Password
            </label>
            <div className={s.pwWrap}>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                className={s.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label="Toggle password visibility"
                className={s.pwToggle}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className={s.row}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className={s.helper}>Remember me</span>
            </label>
            <a href="#" style={{ color: "var(--secondary)" }}>Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} className={s.btnPrimary}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <a href="/smh-app.apk" download className={s.btnOutlineSecondary}>
            Download App
          </a>
        </form>
      </div>
    </section>
  );
}
