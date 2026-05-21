"use client";

import { useMemo } from "react";

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const plainText = useMemo(() => value.replace(/<[^>]*>/g, "").trim(), [value]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 focus-within:border-[var(--brand-rose)] focus-within:ring-2 focus-within:ring-[var(--brand-rose)]/20 transition">
      <textarea
        value={plainText}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[160px] px-3 py-2 text-sm text-slate-900 placeholder-slate-300 focus:outline-none resize-y"
      />
    </div>
  );
}
