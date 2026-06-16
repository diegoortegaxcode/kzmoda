"use client";

import { useState, useTransition, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UserCheck, UserX, Shield, User, Loader2 } from "lucide-react";
import clsx from "clsx";
import { createUserAction, toggleUserAction, type UserRow, type ActionResult } from "./actions";

function RoleBadge({ role }: { role: "ADMIN" | "ASISTENTE" }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
      role === "ADMIN"
        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
        : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
    )}>
      {role === "ADMIN" ? <Shield size={9} /> : <User size={9} />}
      {role === "ADMIN" ? "Admin" : "Asistente"}
    </span>
  );
}

function ToggleButton({ user }: { user: UserRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    const fd = new FormData();
    fd.set("userId", user.id);
    startTransition(async () => {
      const res = await toggleUserAction(null, fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleToggle}
        disabled={isPending}
        title={user.active ? "Desactivar usuario" : "Activar usuario"}
        className={clsx(
          "flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all",
          user.active
            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
          isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : user.active ? (
          <UserX size={11} />
        ) : (
          <UserCheck size={11} />
        )}
        {user.active ? "Desactivar" : "Activar"}
      </button>
      {error && <p className="text-[10px] text-rose-500">{error}</p>}
    </div>
  );
}

const INITIAL_STATE: ActionResult = null;

function CreateModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createUserAction, INITIAL_STATE);

  if (state?.success) {
    onClose();
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[95svh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-900">Nuevo usuario</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nombre completo</label>
            <input
              name="name"
              required
              placeholder="Ana García"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Correo electrónico</label>
            <input
              name="email"
              type="email"
              required
              placeholder="ana@kmoda.pe"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Rol</label>
            <select
              name="role"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              <option value="ASISTENTE">Asistente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          {state?.error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg"
            >
              {state.error}
            </motion.p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl py-2.5 transition-all bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Crear usuario
            </button>
          </div>
        </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AsistentesClient({ users }: { users: UserRow[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <AnimatePresence>{showModal && <CreateModal onClose={() => setShowModal(false)} />}</AnimatePresence>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Usuarios</h1>
            <p className="text-sm text-slate-500 mt-0.5">Administra el acceso al panel administrativo</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus size={16} />
            Nuevo usuario
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
        >
          {users.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <User size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">Sin usuarios todavía</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Avatar */}
                  <div className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                    user.active ? "bg-gradient-to-br from-indigo-400 to-violet-500" : "bg-slate-300"
                  )}>
                    {user.name.trim().split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className={clsx("text-sm font-semibold truncate", user.active ? "text-slate-900" : "text-slate-400")}>
                        {user.name}
                      </p>
                      <RoleBadge role={user.role} />
                      {!user.active && (
                        <span className="text-[10px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Creado {new Date(user.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Toggle */}
                  <ToggleButton user={user} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
