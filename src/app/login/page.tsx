"use client";

import { useActionState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import logo from "@/img/logo.jpeg";
import { loginAction, type LoginResult } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(loginAction, null);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (state && "ok" in state) window.location.href = "/admin";
  }, [state]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 50%, #F8BBD9 100%)" }}
    >
      {/* Rose radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(233,30,99,0.15), transparent)" }}
      />
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(#E91E63 1px, transparent 1px)", backgroundSize: "28px 28px" }}
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
            className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(233,30,99,0.25)" }}
          >
            <Image src={logo} alt="K Moda y Estilo" width={80} height={80} className="w-full h-full object-cover" />
          </motion.div>
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-playfair)", color: "#C2185B" }}
          >
            K Moda y Estilo
          </h1>
          <p className="text-[10px] mt-1 uppercase tracking-[0.2em] font-semibold" style={{ color: "#E91E63" }}>
            Panel de Administración
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-2xl p-7"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(233,30,99,0.15)", backdropFilter: "blur(12px)", boxShadow: "0 4px 32px rgba(233,30,99,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(233,30,99,0.1)" }}>
              <Lock size={13} style={{ color: "#E91E63" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#880E4F" }}>Iniciar sesión</p>
          </div>

          <form action={formAction} className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#AD1457" }}>
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@kmoda.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#FFF5F8",
                  border: "1px solid #F8BBD9",
                  color: "#3D0020",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#E91E63";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(233,30,99,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#F8BBD9";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#AD1457" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#FFF5F8", border: "1px solid #F8BBD9", color: "#3D0020" }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#E91E63";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(233,30,99,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#F8BBD9";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#EC407A" }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {state && "error" in state && state.error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: "rgba(233,30,99,0.08)", color: "#C2185B" }}
              >
                {state.error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: pending ? 1 : 1.02, boxShadow: pending ? undefined : "0 8px 24px rgba(233,30,99,0.35)" }}
              whileTap={{ scale: pending ? 1 : 0.98 }}
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #E91E63, #C2185B)", color: "#fff" }}
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : null}
              {pending ? "Verificando…" : "Ingresar al Panel"}
            </motion.button>
          </form>
        </motion.div>

        <p className="text-center text-[10px] mt-6 uppercase tracking-[0.15em] font-medium" style={{ color: "#E91E63" }}>
          Acceso restringido · Solo personal autorizado
        </p>
      </motion.div>
    </div>
  );
}
