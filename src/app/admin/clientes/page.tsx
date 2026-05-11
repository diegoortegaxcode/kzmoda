import { fetchCustomers } from "./actions";
import ClientesClient from "./ClientesClient";

export default async function ClientesPage() {
  const customers = await fetchCustomers();
  return <ClientesClient customers={customers} />;
}
