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
  const passwordHash = await hashPassword("admin123");

  const admin = await db.user.upsert({
    where: { email: "admin@kmoda.com" },
    update: { passwordHash },
    create: {
      name: "Administrador",
      email: "admin@kmoda.com",
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log(`✓ Usuario: ${admin.email} / admin123  (role: ${admin.role})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
