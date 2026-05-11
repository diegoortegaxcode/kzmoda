"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Calidad garantizada" },
  { icon: Truck, label: "Entrega rápida" },
  { icon: Star, label: "Moda exclusiva" },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export default function Hero() {
  function handleCTA() {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full translate-x-1/3 -translate-y-1/4 opacity-10"
          style={{ background: "radial-gradient(circle, var(--brand-rose), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full -translate-x-1/4 translate-y-1/3 opacity-10"
          style={{ background: "radial-gradient(circle, var(--brand-gold), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: "radial-gradient(circle, var(--brand-rose) 1px, transparent 1px)", backgroundSize: "36px 36px" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div
              {...fade(0.1)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ background: "var(--brand-rose-light)", borderColor: "var(--brand-rose)", borderWidth: 1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--brand-rose)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--brand-rose-dark)" }}>
                Nueva colección 2026
              </span>
            </motion.div>

            <motion.h1
              {...fade(0.18)}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5"
              style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}
            >
              Moda que{" "}
              <span className="relative inline-block">
                <span className="relative z-10" style={{ color: "var(--brand-rose)" }}>
                  te define.
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
                  className="absolute bottom-1 left-0 right-0 h-2 rounded-full origin-left -z-10"
                  style={{ background: "var(--brand-rose-light)" }}
                />
              </span>
              <br />
              <span style={{ color: "#9E9E9E" }}>Estilo que</span>
              <br />
              <span style={{ color: "var(--brand-black)" }}>se recuerda.</span>
            </motion.h1>

            <motion.p {...fade(0.28)} className="text-base text-slate-500 leading-relaxed mb-8 max-w-md">
              Descubre nuestra colección exclusiva de moda femenina. Prendas seleccionadas con elegancia, calidad garantizada y precios directos — sin complicaciones.
            </motion.p>

            <motion.div {...fade(0.36)} className="flex flex-wrap gap-3 mb-10">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 12px 32px -8px rgba(233,30,99,0.35)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCTA}
                className="flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-2xl transition-colors"
                style={{ background: "var(--brand-rose)" }}
              >
                Explorar colección
                <ArrowRight size={15} strokeWidth={2.5} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 border text-sm font-semibold rounded-2xl transition-colors hover:bg-slate-50"
                style={{ borderColor: "var(--brand-gold)", color: "var(--brand-gold-dark)" }}
              >
                Ver ofertas
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div {...fade(0.44)} className="flex flex-wrap gap-4">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon size={13} strokeWidth={2.5} style={{ color: "var(--brand-rose)" }} />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Featured product card */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Decorative cards */}
            <motion.div
              initial={{ opacity: 0, rotate: -6, scale: 0.9 }}
              animate={{ opacity: 1, rotate: -4, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute top-6 right-8 w-52 h-64 rounded-3xl"
              style={{ background: "linear-gradient(135deg, var(--brand-rose-light), #FFDDE8)" }}
            />
            <motion.div
              initial={{ opacity: 0, rotate: 6, scale: 0.9 }}
              animate={{ opacity: 1, rotate: 3, scale: 1 }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute bottom-4 left-8 w-48 h-60 rounded-3xl"
              style={{ background: "linear-gradient(135deg, var(--brand-gold-light), #FFF0A0)" }}
            />

            {/* Main card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6 }}
              className="relative z-10 w-64 bg-white rounded-3xl shadow-xl overflow-hidden border cursor-pointer"
              style={{
                borderColor: "rgba(233,30,99,0.1)",
                boxShadow: "0 24px 64px -12px rgba(233,30,99,0.15), 0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="h-52 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, var(--brand-rose-dark), var(--brand-rose), #FF6B9D)" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl opacity-20 select-none">👗</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-wide">
                    DESTACADO
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span
                    className="px-2 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: "var(--brand-gold)", color: "var(--brand-black)" }}
                  >
                    NUEVO
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--brand-rose)" }}>
                  Vestidos
                </p>
                <p className="text-sm font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                  Vestido Elegance Rose
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">S/ 189</span>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-lg font-light"
                    style={{ background: "var(--brand-rose)" }}
                  >
                    +
                  </motion.button>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="var(--brand-gold)" style={{ color: "var(--brand-gold)" }} />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">4.9 (86)</span>
                </div>
              </div>
            </motion.div>

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -bottom-2 -left-4 bg-white rounded-2xl shadow-lg border border-rose-100 px-4 py-3 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "var(--brand-rose-light)" }}
              >
                <ShieldCheck size={16} style={{ color: "var(--brand-rose)" }} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Este mes</p>
                <p className="text-xs font-bold text-slate-900">+58 pedidos</p>
              </div>
            </motion.div>

            {/* Floating category pill */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -top-2 right-0 rounded-2xl shadow-lg px-4 py-2.5"
              style={{ background: "var(--brand-black)" }}
            >
              <p className="text-[10px] font-bold text-white">320+ prendas</p>
              <p className="text-[9px]" style={{ color: "var(--brand-gold)" }}>disponibles ahora</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
    </section>
  );
}
