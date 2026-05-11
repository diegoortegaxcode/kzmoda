"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "rose" | "amber";
  index: number;
}

const colors = {
  indigo: { ring: "ring-indigo-100", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  emerald: { ring: "ring-emerald-100", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  rose: { ring: "ring-rose-100", iconBg: "bg-rose-50", iconColor: "text-rose-600" },
  amber: { ring: "ring-amber-100", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
};

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(target, Math.round(stepValue * step));
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function KPICard({
  title, value, prefix = "", suffix = "", trend, trendLabel, icon, color, index,
}: KPICardProps) {
  const displayValue = useCountUp(value);
  const { ring, iconBg, iconColor } = colors[color];
  const positive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.1)" }}
      className={clsx(
        "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm ring-1 cursor-default",
        ring
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div
          className={clsx(
            "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
            positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}
        >
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}%
        </div>
      </div>

      <div className="mb-1">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {prefix}{displayValue.toLocaleString("es-PE")}{suffix}
        </span>
      </div>
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{trendLabel}</p>
    </motion.div>
  );
}
