export default function Page() {
  const title = "pacs".replace(/(^|[-/])\w/g, s => s.toUpperCase()).replace(/-/g, " ");
  return (
    <main className="container" style={{ padding: "28px 0" }}>
      <div className="card" style={{ padding: "1.6rem" }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ color: "var(--muted)" }}>Placeholder screen for {title}.</p>
      </div>
    </main>
  );
}
