import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

type Item = { id: string; qty: number };

function parseCookie(raw?: string): Item[] {
  try {
    const data = JSON.parse(raw ?? "[]");
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === "object" && (data[0] as any)?.id) {
        return data.map((x: any) => ({ id: String(x.id), qty: Math.max(1, Number(x.qty ?? 1)) }));
      }
      if (data.length && typeof data[0] === "string") {
        return Array.from(new Set(data as string[])).map(id => ({ id: String(id), qty: 1 }));
      }
    }
  } catch {}
  return [];
}

export async function POST(req: Request) {
  const form = await req.formData();
  const productId = String(form.get("productId") ?? "");
  const qty = Math.max(1, Number(form.get("qty") ?? 1));
  const redirectTo = new URL("/cart", req.url);

  if (!productId) return NextResponse.redirect(redirectTo, { status: 303 });
  const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!exists) return NextResponse.redirect(redirectTo, { status: 303 });

  const jar = await cookies();
  const current = parseCookie(jar.get("cart")?.value);
  const idx = current.findIndex(x => x.id === productId);
  if (idx === -1) current.push({ id: productId, qty });
  else current[idx] = { id: productId, qty: current[idx].qty + qty };

  const res = NextResponse.redirect(redirectTo, { status: 303 });
  res.cookies.set("cart", JSON.stringify(current), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}