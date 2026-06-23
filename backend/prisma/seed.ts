import { PrismaClient, Role } from "@prisma/client";

/// <reference types="node" />

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.log("Set ADMIN_EMAIL to promote a user to admin.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!user) {
    console.log(`No user found with email: ${adminEmail}`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN },
  });

  console.log(`Promoted ${adminEmail} to ADMIN`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
