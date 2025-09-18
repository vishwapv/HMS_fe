// src/components/ui/Toaster.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/components/toast.module.css";
import type { ToastKind } from "../../../lib/toast";

type Message = {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  duration: number;
};

export default function Toaster() {
  const [items, setItems] = useState<Message[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const anyE = e as CustomEvent;
      const { kind = "info", title, description, duration = 3800 } = anyE.detail || {};
      if (!title) return;
      const id = crypto.randomUUID();
      const msg: Message = { id, kind, title, description, duration };
      setItems((prev) => [...prev, msg]);
      window.setTimeout(() => dismiss(id), duration);
    }
    function dismiss(id: string) {
      setItems((prev) => prev.filter((m) => m.id !== id));
    }

    (window as any).__smhToastDismiss__ = dismiss; // allow manual close

    window.addEventListener("smh:toast", onToast as any);
    return () => window.removeEventListener("smh:toast", onToast as any);
  }, []);

  const iconChar = (kind: ToastKind) =>
    kind === "success" ? "✓" : kind === "error" ? "!" : kind === "warning" ? "!" : "i";

  return (
    <div className={styles.wrap} aria-live="polite" aria-atomic="true">
      {items.map((m) => (
        <div key={m.id} className={styles.item} role="status">
          <div className={`${styles.icon} ${styles[m.kind]}`}>{iconChar(m.kind)}</div>
          <div>
            <div className={styles.title}>{m.title}</div>
            {m.description ? <div className={styles.desc}>{m.description}</div> : null}
          </div>
          <button
            className={styles.close}
            aria-label="Dismiss"
            onClick={() => (window as any).__smhToastDismiss__?.(m.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
