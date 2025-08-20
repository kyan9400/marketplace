import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

/** Returns the user id from the "uid" cookie, or null if not present. */
export async function getUserIdFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("uid")?.value ?? null;
}

/**
 * Ensures there is a user id:
 * - If cookie "uid" exists and a user row exists  return it
 * - Otherwise create a guest user, set the cookie, and return the new id
 */
export async function ensureUserId(): Promise<string> {
  const jar = await cookies();
  let uid = jar.get("uid")?.value ?? null;

  if (uid) {
    const exists = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true },
    });
    if (exists) return uid;
    // fall through to create if cookie points to a non-existent user
  }

  uid = randomUUID();

  await prisma.user.upsert({
    where: { id: uid },
    update: {},
    create: {
      id: uid,
      // If your schema requires more fields (e.g. email/name), add defaults here.
    },
  });

  jar.set("uid", uid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return uid;
}