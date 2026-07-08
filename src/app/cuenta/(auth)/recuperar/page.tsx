"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { customerRecoverAction, type RecoverResult } from "./actions";

export default function CustomerRecoverPage() {
  const [state, formAction, pending] = useActionState<RecoverResult, FormData>(customerRecoverAction, null);
  const sent = state && "ok" in state && state.ok;

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
            {sent ? <MailCheck size={24} className="text-white" /> : <KeyRound size={24} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
            {sent ? "Revisa tu correo" : "Recuperar contraseña"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {sent
              ? "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña."
              : "Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña."}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-sm border border-rose-100">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600">
                El enlace expira en 1 hora. Revisa también tu carpeta de spam.
              </p>
              <Link
                href="/cuenta/login"
                className="inline-block w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "var(--brand-rose)" }}
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Correo electrónico
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

              {state && "error" in state && (
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
                {pending ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-xs text-slate-500 mt-5">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/cuenta/login" className="font-semibold text-rose-500 hover:text-rose-600">
                Inicia sesión
              </Link>
            </p>
          )}
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
