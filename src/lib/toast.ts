// src/lib/toast.ts
export type ToastKind = "success" | "error" | "info" | "warning";
export type ToastOptions = {
  kind?: ToastKind;
  title: string;
  description?: string;
  duration?: number; // ms, default 3800
};

// Fire-and-forget helper you can call from anywhere (client-side)
export function toast(opts: ToastOptions) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("smh:toast", { detail: opts }));
}

// Small conveniences
toast.success = (title: string, description?: string, duration?: number) =>
  toast({ kind: "success", title, description, duration });

toast.error = (title: string, description?: string, duration?: number) =>
  toast({ kind: "error", title, description, duration });

toast.info = (title: string, description?: string, duration?: number) =>
  toast({ kind: "info", title, description, duration });

toast.warning = (title: string, description?: string, duration?: number) =>
  toast({ kind: "warning", title, description, duration });
