﻿import { PrismaClient } from "../generated/prisma";

declare global {
  // Avoid re-instantiating Prisma in dev (hot reloads)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

