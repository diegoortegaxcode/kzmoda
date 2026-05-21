import Link from "next/link";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { label: "Colección", href: "#productos" },
  { label: "Populares", href: "#populares" },
  { label: "Recomendados", href: "#interes" },
  { label: "Mi cuenta", href: "/cuenta/login" },
];

export default function StoreFooter() {
  return (
    <footer id="nosotros" className="mt-16 border-t border-rose-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}>
              KZ Moda y Estilo
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mt-3">
              Moda femenina con curaduría premium, entregas rápidas y atención personalizada.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <a href="#" className="w-9 h-9 rounded-xl border border-rose-100 text-slate-500 hover:text-[var(--brand-rose)] hover:bg-rose-50 flex items-center justify-center transition-colors">
                <Instagram size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl border border-rose-100 text-slate-500 hover:text-[var(--brand-rose)] hover:bg-rose-50 flex items-center justify-center transition-colors">
                <Facebook size={15} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800">Navegación</h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-slate-500 hover:text-[var(--brand-rose)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800">Contacto</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2"><Phone size={14} /> +51 999 999 999</li>
              <li className="flex items-center gap-2"><Mail size={14} /> ventas@kzmoda.pe</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Lima, Perú</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800">Newsletter</h4>
            <p className="mt-4 text-sm text-slate-500">
              Recibe lanzamientos, descuentos y prendas destacadas cada semana.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Tu correo"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              />
              <button
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
                style={{ background: "var(--brand-rose)" }}
              >
                Suscribirme
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} KZ Moda y Estilo. Todos los derechos reservados.</p>
          <p>Diseño profesional · Experiencia premium · Compra segura</p>
        </div>
      </div>
    </footer>
  );
}
