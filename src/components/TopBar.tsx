"use client";

import { motion } from "framer-motion";
import { Search, Bell, Plus, LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { logoutAction } from "@/app/login/actions";

interface TopBarProps {
  userName?: string;
  userRole?: "ADMIN" | "ASISTENTE";
}

export default function TopBar({ userName, userRole }: TopBarProps) {
  const [focused, setFocused] = useState(false);
  const [, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => logoutAction());
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-6 shrink-0"
    >
      {/* Search */}
      <motion.div
        animate={{ width: focused ? 320 : 240 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative"
      >
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
        <input
          type="text"
          placeholder="Buscar productos, clientes…"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-8 pr-4 py-1.5 text-xs rounded-lg bg-slate-100 border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
        />
      </motion.div>

      <div className="flex-1" />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus size={14} strokeWidth={2.5} />
        Nuevo Pedido
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell size={16} className="text-slate-500" strokeWidth={2} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
      </motion.button>

      {/* User + logout */}
      {userName && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400">{userRole === "ADMIN" ? "Administrador" : "Asistente"}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            title="Cerrar sesión"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <LogOut size={15} strokeWidth={2} />
          </motion.button>
        </div>
      )}
    </motion.header>
  );
}
