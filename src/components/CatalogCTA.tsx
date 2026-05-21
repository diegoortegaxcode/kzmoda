"use client";

import { motion } from "framer-motion";

export default function CatalogCTA({ productCount }: { productCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-6 py-5"
    >
      <div>
        <p className="text-sm font-bold text-white">Generar catálogo PDF</p>
        <p className="text-xs text-indigo-200 mt-0.5">{productCount} productos activos listos para exportar</p>
      </div>
      <motion.a
        href="/api/catalog/pdf"
        target="_blank"
        whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
        whileTap={{ scale: 0.97 }}
        className="px-5 py-2 bg-white text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-50 transition-colors shrink-0"
      >
        Exportar catálogo →
      </motion.a>
    </motion.div>
  );
}
