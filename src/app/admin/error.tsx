"use client";

import Link from "next/link";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-3xl mb-5 border border-rose-100">
        ⚠️
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">Error en el panel</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        Ocurrió un error inesperado. Puedes reintentar o volver al inicio del panel.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/admin"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Ir al inicio del panel
        </Link>
      </div>
    </div>
  );
}
