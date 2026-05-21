import { fetchUsers } from "./actions";
import AsistentesClient from "./AsistentesClient";

export const dynamic = "force-dynamic";

export default async function AsistentesPage() {
  const users = await fetchUsers();
  return <AsistentesClient users={users} />;
}
