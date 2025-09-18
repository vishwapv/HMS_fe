// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("smh_role") : null;
    if (role === "admin") router.replace("/dashboard/admin");
    else if (role === "pharmacy") router.replace("/dashboard/pharmacy");
    else router.replace("/dashboard/reception"); // default receptionist
  }, [router]);
  return null;
}
