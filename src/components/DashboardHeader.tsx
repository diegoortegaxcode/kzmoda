"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import logo from "@/img/logo.jpeg";

export default function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex items-center gap-4"
    >
      <div>
        <h1 className="text-lg font-bold text-slate-900">Resumen general</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Bienvenido de vuelta ·{" "}
          {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </motion.div>
  );
}
