import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/jwt";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  const session = token ? await verifyJWT(token) : null;

  if (!session || session.role === "CLIENTE") redirect("/login");

  const role = session.role as "ADMIN" | "ASISTENTE";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={session.name} userRole={role} />
        {children}
      </div>
    </div>
  );
}
