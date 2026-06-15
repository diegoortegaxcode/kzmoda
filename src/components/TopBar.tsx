"use client";

import { motion } from "framer-motion";
import { Search, Bell, Plus, LogOut, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopBarProps {
  userName?: string;
  userRole?: "ADMIN" | "ASISTENTE";
}

export default function TopBar({ userName, userRole }: TopBarProps) {
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    customers: { id: string; name: string; phone: string | null }[];
    products: { id: string; name: string; sku: string; stock: number }[];
  }>({ customers: [], products: [] });
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    kind: "DEBT_DUE" | "LOW_STOCK" | "PROOF_PENDING";
    title: string;
    description: string;
    href: string;
    createdAt: string;
    severity: "high" | "medium";
    read: boolean;
  }>>([]);

  const hasResults = useMemo(
    () => results.customers.length > 0 || results.products.length > 0,
    [results]
  );

  useEffect(() => {
    let active = true;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/admin/notifications", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        setNotifications(data.notifications ?? []);
      } catch {
        if (active) setNotifications([]);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  async function markAllRead() {
    const ids = notifications.map((item) => item.id);
    if (ids.length === 0) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_many", notificationIds: ids }),
      });
    } catch {}
  }

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_one", notificationId: id }),
      });
    } catch {}
  }

  async function markUnread(id: string) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: false } : item)));
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unread_one", notificationId: id }),
      });
    } catch {}
  }

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults({ customers: [], products: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`, { cache: "no-store" });
        const data = await res.json();
        setResults({
          customers: data.customers ?? [],
          products: data.products ?? [],
        });
      } catch {
        setResults({ customers: [], products: [] });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function goToNewOrderWith(kind: "customer" | "product", value: string) {
    const param = kind === "customer" ? "customerQuery" : "productQuery";
    router.push(`/admin/pedidos/nuevo?${param}=${encodeURIComponent(value)}`);
    setOpen(false);
    setFocused(false);
    setQuery("");
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="relative h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-6 shrink-0"
    >
      {/* Logo */}

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
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setOpen(false), 140);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim().length >= 2) {
              e.preventDefault();
              goToNewOrderWith("product", query.trim());
            }
          }}
          className="w-full pl-8 pr-4 py-1.5 text-xs rounded-lg bg-slate-100 border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition-colors placeholder:text-slate-400"
        />
        {open && (loading || query.trim().length >= 2) && (
          <div className="absolute top-full mt-1.5 w-[420px] max-w-[90vw] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-40">
            {loading ? (
              <p className="text-xs text-slate-500 px-3 py-3">Buscando…</p>
            ) : hasResults ? (
              <div className="max-h-80 overflow-y-auto">
                {results.customers.length > 0 && (
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Clientes</p>
                    <div className="space-y-1">
                      {results.customers.map((customer) => (
                        <button
                          key={customer.id}
                          onMouseDown={() => goToNewOrderWith("customer", customer.name)}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-xs font-medium text-slate-900">{customer.name}</p>
                          <p className="text-[10px] text-slate-400">{customer.phone || "Sin teléfono"}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {results.products.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Productos</p>
                    <div className="space-y-1">
                      {results.products.map((product) => (
                        <button
                          key={product.id}
                          onMouseDown={() => goToNewOrderWith("product", product.name)}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-xs font-medium text-slate-900">{product.name}</p>
                          <p className="text-[10px] text-slate-400">{product.sku} · {product.stock} en stock</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 px-3 py-3">Sin resultados.</p>
            )}
          </div>
        )}
      </motion.div>

      <div className="flex-1" />

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="rounded-lg"
      >
        <Link
          href="/admin/pedidos/nuevo"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          Nuevo Pedido
        </Link>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setNotifOpen((v) => !v)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell size={16} className="text-slate-500" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>
      {notifOpen && (
        <div className="absolute right-28 top-12 w-[380px] max-w-[95vw] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-40">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
              <p className="text-[11px] text-slate-400">{unreadCount} sin leer</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Marcar todo leído
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-sm text-center text-slate-400">Sin alertas por ahora.</p>
            ) : (
              notifications.map((item) => {
                const unread = !item.read;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markRead(item.id);
                      setNotifOpen(false);
                    }}
                    className={`block px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 ${
                      unread ? "bg-rose-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 w-2 h-2 rounded-full ${item.severity === "high" ? "bg-rose-500" : "bg-amber-500"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {!unread && <CheckCircle2 size={13} className="text-emerald-500 mt-0.5" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (unread) markRead(item.id);
                            else markUnread(item.id);
                          }}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          {unread ? "Marcar leída" : "Marcar no leída"}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* User + logout */}
      {userName && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400">{userRole === "ADMIN" ? "Administrador" : "Asistente"}</p>
          </div>
          <form method="POST" action="/api/auth/logout">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Cerrar sesión"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <LogOut size={15} strokeWidth={2} />
            </motion.button>
          </form>
        </div>
      )}
    </motion.header>
  );
}
