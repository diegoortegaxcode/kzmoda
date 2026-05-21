"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { customerRegisterAction, type RegisterResult } from "./actions";

export default function CustomerRegisterPage() {
  const [state, formAction, pending] = useActionState<RegisterResult, FormData>(customerRegisterAction, null);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-rose-50/40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "var(--brand-rose)", boxShadow: "0 8px 24px rgba(236,72,153,0.25)" }}
          >
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
            Crear cuenta
          </h1>
          <p className="text-sm text-slate-500 mt-1">Regístrate para gestionar tus pedidos</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-sm border border-rose-100">
          <form action={formAction} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Nombre completo <span className="text-rose-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="María García"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Correo electrónico <span className="text-rose-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Teléfono
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="987 654 321"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mín. 6 caracteres"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-slate-900 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Confirmar contraseña <span className="text-rose-500">*</span>
              </label>
              <input
                name="confirm"
                type={showPwd ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            {state?.error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs px-3 py-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"
              >
                {state.error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-2 text-white disabled:opacity-70"
              style={{ background: "var(--brand-rose)" }}
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : null}
              {pending ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link href="/cuenta/login" className="font-semibold text-rose-500 hover:text-rose-600">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Volver a la tienda
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
