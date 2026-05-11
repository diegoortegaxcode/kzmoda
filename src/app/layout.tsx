import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "K Moda y Estilo — Moda con elegancia",
  description: "Descubre la colección exclusiva de K Moda y Estilo. Moda femenina con calidad garantizada y entrega rápida.",
  keywords: ["moda", "ropa", "estilo", "moda femenina", "K Moda"],
  openGraph: {
    title: "K Moda y Estilo",
    description: "Moda femenina con elegancia y calidad garantizada.",
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
