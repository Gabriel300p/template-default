import { PrismaClient, UserRole } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  if (!email) {
    console.log("SUPER_ADMIN_EMAIL not set, skipping super admin seed");
    return;
  }
  const id = process.env.SUPER_ADMIN_ID || crypto.randomUUID();
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) {
    console.log("Super admin already exists");
    return;
  }
  await prisma.user.create({
    data: {
      id,
      email,
      role: UserRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
  });
  console.log("Super admin seeded with id", id, "email", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
