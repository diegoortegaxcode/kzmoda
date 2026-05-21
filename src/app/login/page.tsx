"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { loginAction, type LoginResult } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(loginAction, null);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#0F0F0F" }}
    >
      {/* Gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,55,0.12), transparent)" }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)", backgroundSize: "48px 48px" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C)", boxShadow: "0 8px 32px rgba(212,175,55,0.25)" }}
          >
            <span
              className="text-3xl font-black"
              style={{ fontFamily: "var(--font-playfair)", color: "#0F0F0F" }}
            >
              K
            </span>
          </motion.div>
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-playfair)", color: "#D4AF37" }}
          >
            K Moda y Estilo
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-semibold">
            Panel de Administración
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-2xl p-7"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(212,175,55,0.12)" }}>
              <Lock size={13} style={{ color: "#D4AF37" }} />
            </div>
            <p className="text-sm font-semibold text-white">Iniciar sesión</p>
          </div>

          <form action={formAction} className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@kmoda.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{
                  background: "#252525",
                  border: "1px solid #333",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Contraseña
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: "#252525", border: "1px solid #333" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#333";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {state?.error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: "rgba(233,30,99,0.1)", color: "#F48FB1" }}
              >
                {state.error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: pending ? 1 : 1.02, boxShadow: pending ? undefined : "0 8px 24px rgba(212,175,55,0.3)" }}
              whileTap={{ scale: pending ? 1 : 0.98 }}
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C)", color: "#0F0F0F" }}
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : null}
              {pending ? "Verificando…" : "Ingresar al Panel"}
            </motion.button>
          </form>
        </motion.div>

        <p className="text-center text-[10px] text-slate-700 mt-6 uppercase tracking-[0.15em] font-medium">
          Acceso restringido · Solo personal autorizado
        </p>
      </motion.div>
    </div>
  );
}
