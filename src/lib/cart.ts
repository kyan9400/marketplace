"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export type CartItem = {
  productId: string;
  variantId?: string | null;
  qty: number;
};

const CART_COOKIE = "cart";

async function readCart(): Promise<CartItem[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];

  let parsed: any[] = [];
  try { parsed = JSON.parse(raw); } catch { parsed = []; }

  // Normalize & merge duplicates (e.g., undefined vs null variantId)
  const map = new Map<string, CartItem>();
  for (const it of parsed) {
    const productId = String(it.productId);
    const variantId = it.variantId ?? null;
    const qty = Math.max(1, Number(it.qty ?? 1));

    const key = `${productId}||${variantId ?? "null"}`;
    const existing = map.get(key);
    if (existing) existing.qty += qty;
    else map.set(key, { productId, variantId, qty });
  }
  return Array.from(map.values());
}

async function writeCart(items: CartItem[]) {
  const store = await cookies();
  // Always write normalized items (variantId null instead of undefined)
  const normalized = items.map(i => ({ ...i, variantId: i.variantId ?? null, qty: Math.max(1, Number(i.qty ?? 1)) }));
  store.set(CART_COOKIE, JSON.stringify(normalized), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCart() {
  const items = await readCart();
  if (items.length === 0) return { items: [], subtotalCents: 0 };

  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { shop: true },
  });

  const variantIds = items.map((i) => i.variantId).filter(Boolean) as string[];
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
    : [];

  const enriched = items.map((i) => {
    const p = products.find((pp) => pp.id === i.productId);
    if (!p) return { ...i, missing: true } as any;

    const v = i.variantId ? (variants.find((vv: any) => vv.id === i.variantId) as any) : null;

    const images = p.imagesJson ? (JSON.parse(p.imagesJson) as string[]) : [];
    const unitCents = p.priceCents + (v?.priceCentsDelta ?? 0);
    const totalCents = unitCents * i.qty;

    return {
      ...i,
      product: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        image: images[0] ?? null,
        currency: p.currency,
        priceCents: unitCents,
        shopName: p.shop.name,
      },
      variantLabel: v?.name ?? v?.label ?? v?.sku ?? null,
      totalCents,
    };
  });

  const subtotalCents = enriched.reduce((acc, it: any) => acc + (it.totalCents ?? 0), 0);
  return { items: enriched, subtotalCents };
}

export async function addToCart(data: FormData | { productId: string; qty?: number; variantId?: string | null }) {
  const productId = data instanceof FormData ? String(data.get("productId") ?? "") : data.productId;
  const qty = data instanceof FormData ? Number(data.get("qty") ?? 1) : (data.qty ?? 1);
  const variantId = data instanceof FormData ? (data.get("variantId") ? String(data.get("variantId")) : undefined) : data.variantId;
  if (!productId) return;

  // If a variant was selected, ensure it exists and (optionally) is in stock
  if (variantId) {
    const v = (await prisma.productVariant.findUnique({ where: { id: variantId } })) as any;
    if (!v) return;
    if (typeof v.stockQty === "number" && v.stockQty <= 0) return;
  }

  const items = await readCart();
  // Normalize variantId to null for comparison & storage
  const vId = variantId ?? null;
  const existing = items.find((i) => i.productId === productId && (i.variantId ?? null) === vId);
  if (existing) existing.qty += qty;
  else items.push({ productId, variantId: vId, qty });

  await writeCart(items);
}

export async function updateQty(productId: string, qty: number, variantId?: string | null) {
  const items = await readCart();
  const vId = variantId ?? null;
  const i = items.find((it) => it.productId === productId && (it.variantId ?? null) === vId);
  if (!i) return;
  i.qty = Math.max(1, qty);
  await writeCart(items);
}

export async function removeFromCart(productId: string, variantId?: string | null) {
  const vId = variantId ?? null;
  const items = (await readCart()).filter((it) => !(it.productId === productId && (it.variantId ?? null) === vId));
  await writeCart(items);
}

export async function clearCart() { await writeCart([]); }


// --- Added helper so UI can remove items ---
// Removes an item by setting its qty to "0". Variant is ignored in base impl.
export async function removeItem(productId: string, _variantId?: string | null) {
  "use server";
  // If your updateQty signature differs, adapt this call accordingly.
  await updateQty(productId, 0);
}