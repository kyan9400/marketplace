// src/lib/user.ts
import { prisma } from "@/lib/db";
import { cookies as cookiesApi } from "next/headers";
import { randomUUID } from "crypto";

// In Next 15, cookies() returns a Promise<ReadonlyRequestCookies>
export type CookieStore = Awaited<ReturnType<typeof cookiesApi>>;

export function getUserIdFromCookie(jar: CookieStore) {
  return jar.get("uid")?.value ?? null;
}

export async function ensureUserId(jar: CookieStore) {
  let uid = getUserIdFromCookie(jar);
  if (!uid) uid = `guest_${randomUUID()}`;

  await prisma.user.upsert({
    where: { id: uid },
    update: {},
    create: {
      id: uid,
      email: `${uid}@guest.local`,
      name: "Guest",
      role: "BUYER",
    },
  });

  // Only call set() in server actions/route handlers
  jar.set("uid", uid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return uid;
}
