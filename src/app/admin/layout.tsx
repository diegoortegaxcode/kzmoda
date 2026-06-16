import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/jwt";
import AdminShell from "@/components/AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  const session = token ? await verifyJWT(token) : null;

  if (!session || session.role === "CLIENTE") redirect("/cuenta/login");

  const role = session.role as "ADMIN" | "ASISTENTE";

  return (
    <AdminShell role={role} userName={session.name} userRole={role}>
      {children}
    </AdminShell>
  );
}
