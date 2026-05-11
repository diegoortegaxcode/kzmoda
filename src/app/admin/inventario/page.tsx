import { fetchInventario } from "./actions";
import InventarioClient from "./InventarioClient";

export default async function InventarioPage() {
  const { products, categories } = await fetchInventario();
  return <InventarioClient products={products} categories={categories} />;
}
