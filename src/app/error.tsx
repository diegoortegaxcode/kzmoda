"use client";

import Link from "next/link";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-rose-50/40">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-3xl mb-5">
        ⚠️
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Algo salió mal</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        Ocurrió un error inesperado. Puedes intentar recargar la página.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--brand-rose)" }}
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
