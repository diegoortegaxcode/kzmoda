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

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kmodayestilo.com";

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "K Moda y Estilo — Moda femenina con elegancia",
    template: "%s — K Moda y Estilo",
  },
  description: "Descubre la colección exclusiva de K Moda y Estilo. Moda femenina con calidad garantizada y entrega rápida.",
  keywords: ["moda", "ropa", "estilo", "moda femenina", "K Moda", "vestidos", "blusas", "Lima", "Perú"],
  authors: [{ name: "K Moda y Estilo" }],
  creator: "K Moda y Estilo",
  icons: {
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
  openGraph: {
    title: "K Moda y Estilo — Moda femenina con elegancia",
    description: "Descubre la colección exclusiva de K Moda y Estilo. Moda femenina con calidad garantizada y entrega rápida.",
    url: base,
    siteName: "K Moda y Estilo",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "K Moda y Estilo",
    description: "Moda femenina con elegancia y calidad garantizada.",
  },
  alternates: { canonical: base },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
