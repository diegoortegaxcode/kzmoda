"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff5f8" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 28 }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
            Algo salió mal
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px", maxWidth: 360 }}>
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={reset}
              style={{ padding: "10px 20px", borderRadius: 12, background: "#e91e63", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Reintentar
            </button>
            <a
              href="/"
              style={{ padding: "10px 20px", borderRadius: 12, background: "#f1f5f9", color: "#475569", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
