export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  cashPrice?: number | null;
  separateDeposit?: number | null;
  stock: number;
  images: string[];
  category: string;
  categorySlug: string;
  featured?: boolean;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
}

export const mockCategories: StoreCategory[] = [
  { id: "1", name: "Calzado", slug: "calzado" },
  { id: "2", name: "Ropa", slug: "ropa" },
  { id: "3", name: "Accesorios", slug: "accesorios" },
  { id: "4", name: "Deportes", slug: "deportes" },
];

export const mockProducts: StoreProduct[] = [
  { id: "p1", name: "Zapatillas Runner Pro", description: "Diseñadas para rendimiento máximo. Suela de goma con amortiguación premium.", price: 280, stock: 14, images: [], category: "Calzado", categorySlug: "calzado", featured: true },
  { id: "p2", name: "Zapatillas Casual Blancas", description: "Minimalistas y versátiles. Perfectas para el día a día.", price: 185, stock: 22, images: [], category: "Calzado", categorySlug: "calzado" },
  { id: "p3", name: "Botines Cuero Premium", description: "Cuero genuino, suela de goma antideslizante. Durabilidad garantizada.", price: 420, stock: 8, images: [], category: "Calzado", categorySlug: "calzado" },
  { id: "p4", name: "Polo Oversize Blanco", description: "100% algodón pima. Corte holgado y contemporáneo.", price: 65, stock: 45, images: [], category: "Ropa", categorySlug: "ropa", featured: true },
  { id: "p5", name: "Casaca Denim Azul", description: "Denim de alta densidad, lavado vintage. Talla única oversize.", price: 195, stock: 18, images: [], category: "Ropa", categorySlug: "ropa" },
  { id: "p6", name: "Short Deportivo Gris", description: "Tela dry-fit, cintura elástica regulable. Ideal para entrenamientos.", price: 55, stock: 30, images: [], category: "Ropa", categorySlug: "ropa" },
  { id: "p7", name: "Jogger Premium Negro", description: "Fleece interior suave, corte slim. Costuras reforzadas.", price: 120, stock: 25, images: [], category: "Ropa", categorySlug: "ropa" },
  { id: "p8", name: "Bolso Cuero Marrón", description: "Cuero genuino artesanal. Cierre magnético y forro interior premium.", price: 340, stock: 6, images: [], category: "Accesorios", categorySlug: "accesorios", featured: true },
  { id: "p9", name: "Gorra Snapback Negra", description: "Bordado de alta definición. Ajuste snapback universal.", price: 45, stock: 50, images: [], category: "Accesorios", categorySlug: "accesorios" },
  { id: "p10", name: "Mochila Urbana 25L", description: "Compartimento para laptop 15\", bolsillos organizadores. Tela impermeable.", price: 165, stock: 12, images: [], category: "Accesorios", categorySlug: "accesorios" },
  { id: "p11", name: "Kit Gym Completo", description: "Guantes, correas y banda elástica. Set profesional para entrenamiento.", price: 95, stock: 20, images: [], category: "Deportes", categorySlug: "deportes" },
  { id: "p12", name: "Zapatillas Training X", description: "Soporte lateral reforzado, mesh transpirable. Rendimiento en sala.", price: 235, stock: 9, images: [], category: "Deportes", categorySlug: "deportes" },
];
