import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const cookieOpts = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365, // 1 year
};

export type Session = { uid: string | null; email: string | null };

export async function getSession(): Promise<Session> {
  const jar = await cookies();
  return {
    uid: jar.get("uid")?.value ?? null,
    email: jar.get("email")?.value ?? null,
  };
}

/** Email-only sign in (creates account if missing) */
export async function signIn(email: string, name?: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized)) {
    throw new Error("Please enter a valid email address.");
  }

  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: name ? { name } : {},
    create: { email: normalized, name },
  });

  const jar = await cookies();
  jar.set("uid", user.id, cookieOpts);
  jar.set("email", user.email, cookieOpts);

  return user;
}

export async function signOut() {
  const jar = await cookies();
  jar.delete("uid");
  jar.delete("email");
}

/** Redirects to /signin if not logged in, returns uid otherwise */
export async function requireUserId(): Promise<string> {
  const { uid } = await getSession();
  if (!uid) redirect("/signin");
  return uid!;
}

/** Back-compat: ensure a uid exists; create a guest user if needed and return uid */
export async function ensureUserId(): Promise<string> {
  const { uid, email } = await getSession();
  if (uid) return uid;

  // Force a string type (avoid null/undefined)
  let userEmail: string;
  if (email) {
    userEmail = email;
  } else {
    const rid =
      (globalThis as any)?.crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2);
    userEmail = `guest-${rid}@example.com`;
  }

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: { email: userEmail, name: email ? undefined : "Guest" },
  });

  const jar = await cookies();
  jar.set("uid", user.id, cookieOpts);
  jar.set("email", user.email, cookieOpts);

  return user.id;
}

/** Back-compat: just read uid from cookie (no redirect, may be null) */
export async function getUserIdFromCookie(): Promise<string | null> {
  const { uid } = await getSession();
  return uid;
}
