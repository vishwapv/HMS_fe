import "./styles/globals.css";
import { cookies } from "next/headers";
import Header from "./components/common/Header";
import Toaster from "./components/common/Toaster";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const role = (await cookies()).get("smh_role")?.value ?? null; // "admin" | "receptionist" | "pharmacy" | null

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Header initialRole={role as any} />
        <main className="container" style={{ padding: "24px 0 64px" }}>
          {children}
          <Toaster />
        </main>
      </body>
    </html>
  );
}
