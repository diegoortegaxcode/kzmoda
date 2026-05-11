import { fetchPendingDebts } from "./actions";
import DeudasClient from "./DeudasClient";

export default async function DeudasPage() {
  const { rows, totalRemaining, totalInMora } = await fetchPendingDebts();
  return <DeudasClient rows={rows} totalRemaining={totalRemaining} totalInMora={totalInMora} />;
}
