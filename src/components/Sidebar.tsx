"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard,
  FileText, Settings, ChevronRight, UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  badgeColor?: "rose" | "default";
  adminOnly?: boolean;
}

const nav: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/productos", icon: Package, label: "Productos", badge: 12 },
  { href: "/admin/inventario", icon: Warehouse, label: "Inventario" },
  { href: "/admin/clientes", icon: Users, label: "Clientes", badge: 3 },
  { href: "/admin/deudas", icon: CreditCard, label: "Deudas", badge: 7, badgeColor: "rose" },
  { href: "/admin/catalogo", icon: FileText, label: "Catálogo PDF" },
  { href: "/admin/asistentes", icon: UserCog, label: "Asistentes", adminOnly: true },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

interface SidebarProps {
  role: "ADMIN" | "ASISTENTE";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  const visibleNav = nav.filter((n) => !n.adminOnly || isAdmin);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-60 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 z-20"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black"
            style={{ background: "linear-gradient(135deg, var(--brand-rose), var(--brand-rose-dark))" }}
          >
            K
          </div>
          <div>
            <p
              className="text-sm font-bold leading-none"
              style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}
            >
              K Moda
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
              {isAdmin ? "Administrador" : "Asistente"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
          Principal
        </p>
        <motion.ul variants={container} initial="hidden" animate="visible" className="space-y-0.5">
          {visibleNav.map(({ href, icon: Icon, label, badge, badgeColor }) => {
            const active = isActive(href);
            return (
              <motion.li key={href} variants={item}>
                <Link href={href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.15 }}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative group",
                      active
                        ? "text-[var(--brand-rose)]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "var(--brand-rose-light)", zIndex: -1 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <Icon
                      size={17}
                      className={clsx(!active && "text-slate-400 group-hover:text-slate-600")}
                      style={active ? { color: "var(--brand-rose)" } : undefined}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span
                        className={clsx(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          badgeColor === "rose"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                    {active && (
                      <ChevronRight size={13} style={{ color: "var(--brand-rose)" }} />
                    )}
                  </motion.div>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>

        {isAdmin && (
          <>
            <div className="my-4 border-t border-slate-100" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
              Configuración
            </p>
            <Link href="/admin/configuracion">
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Settings size={17} className="text-slate-400" strokeWidth={2} />
                Configuración
              </motion.div>
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100">
        <motion.div
          whileHover={{ backgroundColor: "#F8FAFC" }}
          className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{
              background: isAdmin
                ? "linear-gradient(135deg, var(--brand-rose), var(--brand-rose-dark))"
                : "linear-gradient(135deg, var(--brand-gold), var(--brand-gold-dark))",
            }}
          >
            {isAdmin ? "AD" : "AS"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {isAdmin ? "Administrador" : "Asistente"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">K Moda y Estilo</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </motion.div>
      </div>
    </motion.aside>
  );
}
