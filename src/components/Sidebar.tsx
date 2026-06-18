"use client";

import {
  LayoutDashboard, Warehouse, Users, CreditCard,
  Settings, ChevronRight, FileCheck, ShoppingBag, ImageIcon, X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import logo from "@/img/logo.jpeg";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  badgeColor?: "rose" | "default";
  adminOnly?: boolean;
}

const nav: NavItem[] = [
  { href: "/admin",              icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/admin/inventario",   icon: Warehouse,       label: "Inventario"    },
  { href: "/admin/clientes",     icon: Users,           label: "Clientes"      },
  { href: "/admin/pedidos",      icon: ShoppingBag,     label: "Pedidos"       },
  { href: "/admin/deudas",       icon: CreditCard,      label: "Deudas",       badgeColor: "rose" },
  { href: "/admin/comprobantes", icon: FileCheck,       label: "Comprobantes", badgeColor: "rose" },
  { href: "/admin/banners",      icon: ImageIcon,       label: "Banners" },
];

interface SidebarProps {
  role: "ADMIN" | "ASISTENTE";
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";
  const visibleNav = nav.filter((n) => !n.adminOnly || isAdmin);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={clsx(
        "h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 z-40",
        "fixed md:relative",
        "w-72 md:w-60",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo + mobile close */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src={logo}
            alt="KZ Tendencias"
            width={32}
            height={32}
            className="rounded-xl object-cover"
          />
          <div>
            <p
              className="text-sm font-bold leading-none"
              style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}
            >
              KZ Tendencias
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
              {isAdmin ? "Administrador" : "Asistente"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
          Principal
        </p>
        <ul className="space-y-0.5">
          {visibleNav.map(({ href, icon: Icon, label, badge, badgeColor }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link href={href} onClick={onClose}>
                  <div
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
                      active
                        ? "text-[var(--brand-rose)]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {active && (
                      <span
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "var(--brand-rose-light)", zIndex: -1 }}
                      />
                    )}
                    <Icon
                      size={17}
                      className={clsx(!active && "text-slate-400")}
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
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <div className="my-4 border-t border-slate-100" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 mb-2">
              Configuración
            </p>
            <Link href="/admin/configuracion" onClick={onClose}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Settings size={17} className="text-slate-400" strokeWidth={2} />
                Configuración
              </div>
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2.5 rounded-xl">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
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
            <p className="text-[10px] text-slate-400 truncate">KZ Tendencias</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
