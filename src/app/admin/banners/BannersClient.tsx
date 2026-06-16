"use client";

import { useActionState, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, ImageIcon, Link as LinkIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import {
  createBannerAction, toggleBannerAction, deleteBannerAction,
  type BannerRow,
} from "./actions";

export default function BannersClient({ banners: initial }: { banners: BannerRow[] }) {
  const [banners, setBanners] = useState<BannerRow[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(createBannerAction, null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.trim();
    if (v.startsWith("http")) setPreview(v);
    else setPreview(null);
  }

  function handleToggle(id: string, current: boolean) {
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, active: !current } : b));
    startTransition(() => toggleBannerAction(id, !current));
  }

  function handleDelete(id: string) {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    startTransition(() => deleteBannerAction(id));
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Banners del Home</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            El primer banner activo se muestra en el hero de la tienda.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold self-start sm:self-auto"
          style={{ background: "var(--brand-rose)" }}
        >
          <Plus size={15} />
          Nuevo banner
        </motion.button>
      </div>

      {/* Upload form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[95svh] sm:max-h-[92vh] flex flex-col"
            >
              <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h2 className="text-base font-semibold text-slate-900">Subir banner</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                action={async (fd) => {
                  await formAction(fd);
                  setShowForm(false);
                  setPreview(null);
                  // Refresh list
                  const { getBanners } = await import("./actions");
                  setBanners(await getBanners());
                }}
                className="p-6 space-y-4"
              >
                {/* Image upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Imagen <span className="text-rose-500">*</span>
                  </label>
                  <div
                    className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 cursor-pointer hover:border-rose-300 transition-colors"
                    style={{ height: preview ? "auto" : 120 }}
                  >
                    {preview ? (
                      <div className="relative w-full" style={{ aspectRatio: "16/5" }}>
                        <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                        <ImageIcon size={28} />
                        <span className="text-xs">Haz clic o arrastra una imagen</span>
                      </div>
                    )}
                    <input
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                {/* URL input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <LinkIcon size={11} /> O pega una URL de imagen
                  </label>
                  <input
                    name="imageUrl"
                    type="url"
                    placeholder="https://..."
                    onChange={handleUrlChange}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                  />
                </div>

                {/* Title */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Título (opcional)
                    </label>
                    <input
                      name="title"
                      type="text"
                      placeholder="Nueva colección"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Subtítulo (opcional)
                    </label>
                    <input
                      name="subtitle"
                      type="text"
                      placeholder="Hasta 30% off"
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                    />
                  </div>
                </div>

                {/* Link */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Enlace al hacer clic (opcional)
                  </label>
                  <input
                    name="link"
                    type="text"
                    placeholder="/coleccion o https://..."
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                  />
                </div>

                {state?.error && (
                  <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{state.error}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setPreview(null); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: pending ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={pending}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "var(--brand-rose)" }}
                  >
                    {pending ? <><Loader2 size={14} className="animate-spin" /> Subiendo…</> : "Guardar banner"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ImageIcon size={40} strokeWidth={1.2} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No hay banners todavía</p>
          <p className="text-xs mt-1">Agrega uno para que aparezca en el home</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-stretch">
                {/* Image preview */}
                <div className="relative w-full h-36 sm:w-48 sm:h-auto shrink-0 bg-slate-100">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title ?? "Banner"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {i === 0 && banner.active && (
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: "var(--brand-rose)" }}
                    >
                      Activo
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {banner.title ?? <span className="text-slate-400 font-normal italic">Sin título</span>}
                    </p>
                    {banner.subtitle && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{banner.subtitle}</p>
                    )}
                    {banner.link && (
                      <p className="text-xs text-rose-400 truncate mt-1 flex items-center gap-1">
                        <LinkIcon size={10} /> {banner.link}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggle(banner.id, banner.active)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                      style={
                        banner.active
                          ? { background: "var(--brand-rose-light)", borderColor: "var(--brand-rose)", color: "var(--brand-rose-dark)" }
                          : { background: "#F1F5F9", borderColor: "#CBD5E1", color: "#64748B" }
                      }
                    >
                      {banner.active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {banner.active ? "Visible" : "Oculto"}
                    </motion.button>

                    {/* Delete */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(banner.id)}
                      disabled={isPending}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center pb-4">
        El primer banner activo (posición 1) se muestra en el hero del home. Los demás quedan guardados.
      </p>
    </div>
  );
}
