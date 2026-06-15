import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const db = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function main() {
  const adminPasswordHash = await hashPassword("admin123");
  const customerPasswordHash = await hashPassword("cliente123");

  const admin = await db.user.upsert({
    where: { email: "admin@kmoda.com" },
    update: { passwordHash: adminPasswordHash, active: true },
    create: {
      name: "Administrador",
      email: "admin@kmoda.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      active: true,
    },
  });

  const customer = await db.customer.upsert({
    where: { email: "cliente@kmoda.com" },
    update: { passwordHash: customerPasswordHash, active: true },
    create: {
      name: "Cliente Demo",
      email: "cliente@kmoda.com",
      phone: "999999999",
      passwordHash: customerPasswordHash,
      active: true,
    },
  });

  if (process.env.SEED_RESET_CUSTOMER_PASSWORDS === "true") {
    const result = await db.customer.updateMany({
      where: { email: { not: null }, passwordHash: null },
      data: { passwordHash: customerPasswordHash, active: true },
    });
    console.log(`✓ Clientes importados habilitados: ${result.count} / cliente123`);
  }

  console.log(`✓ Usuario: ${admin.email} / admin123  (role: ${admin.role})`);
  console.log(`✓ Cliente demo: ${customer.email} / cliente123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
