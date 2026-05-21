import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/jwt";
import CustomerNav from "./CustomerNav";

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get("kmoda_customer")?.value;
  const session = token ? await verifyJWT(token) : null;

  if (!session || session.role !== "CLIENTE") redirect("/cuenta/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <CustomerNav name={session.name} />
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
