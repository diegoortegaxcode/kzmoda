import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  const session = token ? await verifyJWT(token) : null;
  if (!session || session.role === "CLIENTE") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ customers: [], products: [] });
  }

  const [customers, products] = await Promise.all([
    db.customer.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
    db.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, sku: true, stock: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
  ]);

  return NextResponse.json({ customers, products });
}
