"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Package } from "lucide-react";
import { customerLogoutAction } from "../(auth)/login/actions";
import logo from "@/img/logo.jpeg";
import clsx from "clsx";

export default function CustomerNav({ name }: { name: string }) {
  const pathname = usePathname();
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <header className="bg-white border-b border-rose-100 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src={logo} alt="KZ Tendencias" width={32} height={32} className="rounded-lg object-cover" />
          <span className="text-sm font-bold hidden sm:block" style={{ fontFamily: "var(--font-playfair)" }}>
            KZ Tendencias
          </span>
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          <Link
            href="/cuenta/pedidos"
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/cuenta/pedidos") || pathname.startsWith("/cuenta/deudas")
                ? "bg-rose-50 text-rose-600"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Package size={15} />
            Mis pedidos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: "var(--brand-rose)" }}
            >
              {initials}
            </div>
            <span className="text-xs font-medium text-slate-700 hidden sm:block truncate max-w-[120px]">
              {name}
            </span>
          </div>

          <form action={customerLogoutAction}>
            <button
              type="submit"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
