import { fetchInventario } from "./actions";
import InventarioClient from "./InventarioClient";

export default async function InventarioPage() {
  const { products, categories, allCategories } = await fetchInventario();
  return <InventarioClient products={products} categories={categories} allCategories={allCategories} />;
}
