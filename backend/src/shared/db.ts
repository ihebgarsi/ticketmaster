import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const initializeDb = async () => {
  await prisma.$connect();
};

export const db = prisma;
