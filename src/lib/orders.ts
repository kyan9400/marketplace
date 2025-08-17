import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

type CartItem = { id: string; qty: number };

function parseCartCookie(raw?: string): CartItem[] {
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

// Persist a viewer id in a cookie so orders page can query by the same id
async function getOrCreateViewerId(): Promise<string> {
  const jar = await cookies();
  let uid = jar.get("uid")?.value;
  if (!uid) {
    uid = "guest-" + Math.random().toString(36).slice(2, 10);
    jar.set("uid", uid, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }
  return uid;
}

export async function placeOrder() {
  const jar = await cookies();
  const items = parseCartCookie(jar.get("cart")?.value);

  if (items.length === 0) return { ok: false as const, reason: "EMPTY" };

  // Load products
  const ids = items.map(i => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, priceCents: true, currency: true },
  });
  if (products.length === 0) return { ok: false as const, reason: "MISSING_PRODUCTS" };

  const byId = new Map(products.map(p => [p.id, p]));
  const rows = items
    .map(i => ({ item: i, product: byId.get(i.id) }))
    .filter((r): r is { item: CartItem; product: { id: string; title: string; priceCents: number; currency: string } } => !!r.product);

  if (rows.length === 0) return { ok: false as const, reason: "MISSING_PRODUCTS" };

  const subtotalCents = rows.reduce((sum, r) => sum + r.product.priceCents * r.item.qty, 0);
  const currency = rows[0].product.currency ?? "USD";

  // Ensure a user exists to satisfy the foreign key
  const userId = await getOrCreateViewerId();
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    // If your User model requires different fields, adjust here:
    create: { id: userId, name: "Guest", email: `${userId}@example.local` },
  });

  // Create order & items (omit status/paymentStatus so defaults apply)
  const order = await prisma.order.create({
    data: {
      userId,
      currency,
      subtotalCents,
      discountCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: subtotalCents,
      items: {
        create: rows.map(({ item, product }) => ({
          productId: product.id,
          titleSnapshot: product.title,
          unitPriceCents: product.priceCents,
          qty: item.qty,
          totalCents: product.priceCents * item.qty,
        })),
      },
    },
    select: { id: true },
  });

  // Clear cart
  jar.set("cart", "[]", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });

  return { ok: true as const, orderId: order.id };
}