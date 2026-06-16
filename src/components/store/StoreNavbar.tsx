"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/img/logo.jpeg";

const links = [
  { label: "Colección", href: "#productos" },
  { label: "Novedades", href: "#novedades" },
  { label: "Ofertas", href: "#ofertas" },
];

interface CustomerInfo { name: string; initials: string }

export default function StoreNavbar({ customer }: { customer?: CustomerInfo | null }) {
  const { count, toggle } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  };

  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    if (searchOpen) setQuery("");
  };

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-rose-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src={logo}
              alt="KZ Moda y Estilo"
              width={40}
              height={40}
              className="rounded-xl object-cover"
            />
            <span
              className="text-sm font-bold hidden sm:block tracking-wide"
              style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}
            >
              KZ Moda{" "}
              <span style={{ color: "var(--brand-rose)" }}>y</span>{" "}
              Estilo
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-600 rounded-lg transition-colors hover:text-[var(--brand-rose)] hover:bg-[var(--brand-rose-light)]"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSearch}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-500 hover:text-[var(--brand-rose)] transition-colors"
              aria-label="Buscar"
            >
              {searchOpen ? <X size={17} strokeWidth={2} /> : <Search size={17} strokeWidth={2} />}
            </motion.button>

            {customer ? (
              <Link href="/cuenta/pedidos">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-white text-[11px] font-bold"
                  style={{ background: "var(--brand-rose)" }}
                  title={customer.name}
                >
                  {customer.initials}
                </motion.div>
              </Link>
            ) : (
              <Link href="/cuenta/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-500 hover:text-[var(--brand-rose)] transition-colors"
                  title="Mi cuenta"
                >
                  <User size={17} strokeWidth={2} />
                </motion.div>
              </Link>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggle}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-700 transition-colors"
            >
              <ShoppingBag size={18} strokeWidth={2} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1"
                    style={{ background: "var(--brand-rose)" }}
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-600 transition-colors"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-rose-100"
            >
              <form onSubmit={handleSearch} className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2">
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos, categorías…"
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--brand-rose)" }}
                >
                  Buscar
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden overflow-hidden border-t border-rose-100"
            >
              <nav className="px-4 py-3 flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-[var(--brand-rose)] rounded-xl transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="h-16" />
    </>
  );
}
