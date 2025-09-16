export default function HomePage(){
  return (
    <main className="container" style={{padding:"28px 0"}}>
      <div className="card" style={{padding:"2rem", textAlign:"center"}}>
        <h1 style={{margin:"0 0 .5rem", fontSize:"2rem"}}>SMH Hospital Management System</h1>
        <p style={{color:"var(--muted)", margin:0}}>Where Care Meets Excellence</p>
        <div style={{marginTop:"1.25rem", display:"flex", gap:".65rem", justifyContent:"center"}}>
          <a className="btn btn-primary" href="/login">Sign in</a>
          <a className="btn btn-outline-secondary" href="/patients">Quick Patients</a>
        </div>
      </div>
    </main>
  );
}
