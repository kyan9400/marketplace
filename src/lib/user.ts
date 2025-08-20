import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function ensureUserId(): Promise<string> {
  const jar = await cookies();
  let uid = jar.get("uid")?.value;
  if (!uid) {
    uid = randomUUID();
    jar.set("uid", uid, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60*60*24*365 });
  }
  await prisma.user.upsert({
    where: { id: uid },
    update: {},
    create: { id: uid, email: `guest-${uid}@example.invalid`, name: "Guest" },
  });
  return uid;
}

export async function getUserIdFromCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get("uid")?.value;
}
