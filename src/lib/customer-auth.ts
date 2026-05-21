"use server";

import { cookies } from "next/headers";
import { verifyJWT, type SessionPayload } from "./jwt";

export async function getCustomerSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get("kmoda_customer")?.value;
  if (!token) return null;
  const session = await verifyJWT(token);
  if (!session || session.role !== "CLIENTE") return null;
  return session;
}
