import "./styles/globals.css";
import Header from "./components/common/Header";

export const metadata = {
  title: "SMH Hospital Management System",
  description: "Where Care Meets Excellence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container" style={{padding: "24px 0 64px"}}>
          {children}
        </main>
      </body>
    </html>
  );
}