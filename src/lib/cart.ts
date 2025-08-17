"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export type CartItem = {
  productId: string;
  variantId?: string | null;
  qty: number;
};

const CART_COOKIE = "cart";

function readCart(): CartItem[] {
  const raw = cookies().get(CART_COOKIE)?.value;
  if (!raw) return [];
  try { return JSON.parse(raw) as CartItem[]; } catch { return []; }
}

function writeCart(items: CartItem[]) {
  cookies().set(CART_COOKIE, JSON.stringify(items), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getCart() {
  const items = readCart();
  if (items.length === 0) return { items: [], subtotalCents: 0 };

  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { shop: true },
  });

  const enriched = items.map((i) => {
    const p = products.find((pp) => pp.id === i.productId);
    if (!p) return { ...i, missing: true } as any;

    const images = p.imagesJson ? (JSON.parse(p.imagesJson) as string[]) : [];
    const unitCents = p.priceCents;
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

  const items = readCart();
  const existing = items.find((i) => i.productId === productId && i.variantId === variantId);
  if (existing) existing.qty += qty;
  else items.push({ productId, variantId, qty });

  writeCart(items);
}

export async function updateQty(productId: string, qty: number, variantId?: string | null) {
  const items = readCart();
  const i = items.find((it) => it.productId === productId && it.variantId === variantId);
  if (!i) return;
  i.qty = Math.max(1, qty);
  writeCart(items);
}

export async function removeFromCart(productId: string, variantId?: string | null) {
  const items = readCart().filter((it) => !(it.productId === productId && it.variantId === variantId));
  writeCart(items);
}

export async function clearCart() { writeCart([]); }
