"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Paginación en cliente reutilizable.
 * Recibe la lista ya filtrada y devuelve la porción de la página actual.
 * Se reinicia a la página 1 cuando cambia el total de items (p. ej. al filtrar).
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Si el filtro reduce los resultados y la página actual queda fuera de rango, corrige.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return { page, setPage, pageCount, pageItems, total, pageSize, from, to };
}

function pageNumbers(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < pageCount - 1) pages.push("…");
  pages.push(pageCount);
  return pages;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  from,
  to,
  total,
  label = "resultados",
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  from: number;
  to: number;
  total: number;
  label?: string;
}) {
  if (total === 0) return null;

  const nums = pageNumbers(page, pageCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-400">
        Mostrando <span className="font-semibold text-slate-600">{from}</span>–
        <span className="font-semibold text-slate-600">{to}</span> de{" "}
        <span className="font-semibold text-slate-600">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={15} />
        </button>

        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-300 text-xs">
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                n === page
                  ? "text-white shadow-sm"
                  : "border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              style={n === page ? { background: "var(--brand-rose)" } : undefined}
            >
              {n}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
