"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShoppingCart, Search, Filter } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { StoreProduct, StoreCategory } from "@/lib/mock-data";
import Link from "next/link";

interface ProductGridProps {
  products: StoreProduct[];
  categories: StoreCategory[];
}

export default function ProductGrid({ products, categories }: ProductGridProps) {
  const { add } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.categorySlug === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                <Link href={`/producto/${product.id}`} className="block h-full w-full">
                  <img
                    src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-600 shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => add({ id: product.id, name: product.name, price: product.price, category: product.category, image: product.images[0] })}
                  type="button"
                  className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-2xl flex items-center justify-center text-indigo-600 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="p-6">
                <Link href={`/producto/${product.id}`} className="block">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                  {product.description}
                </p>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xl font-black text-gray-900">
                      S/ {product.price.toFixed(2)}
                    </span>
                    {product.cashPrice && (
                      <p className="text-xs font-semibold text-rose-500 mt-0.5">
                        🔥 Al contado S/ {product.cashPrice.toFixed(2)}
                      </p>
                    )}
                    {product.separateDeposit && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sepáralo desde S/ {product.separateDeposit.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    En stock
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-3xl mb-4 text-gray-300">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No encontramos nada</h3>
          <p className="text-gray-500">Intenta con otros filtros o términos de búsqueda.</p>
        </div>
      )}
    </section>
  );
}
