import { getPromotions, getProductOptions } from "./actions";
import PromocionesClient from "./PromocionesClient";

export const dynamic = "force-dynamic";

export default async function PromocionesPage() {
  const [promotions, products] = await Promise.all([getPromotions(), getProductOptions()]);
  return <PromocionesClient promotions={promotions} products={products} />;
}
