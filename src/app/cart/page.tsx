import Link from "next/link";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

type CartItem = { id: string; qty: number };

function parseCookie(raw?: string): CartItem[] {
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

export default async function CartPage() {
  const jar = await cookies();
  const items = parseCookie(jar.get("cart")?.value);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
        <p className="mt-4 text-slate-600">Your cart is empty.</p>
        <Link href="/products" className="mt-3 inline-block text-indigo-600 hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  const ids = items.map(i => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, priceCents: true, currency: true },
  });

  const byId = new Map(products.map(p => [p.id, p]));
  const rows = items
    .map(i => ({ item: i, product: byId.get(i.id) }))
    .filter((r): r is { item: CartItem; product: { id: string; title: string; priceCents: number; currency: string } } => !!r.product);

  const subtotalCents = rows.reduce((sum, r) => sum + r.product.priceCents * r.item.qty, 0);
  const currency = rows[0]?.product.currency ?? "USD";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-2xl border bg-white shadow-sm">
        <h1 className="px-6 pt-6 text-3xl font-bold tracking-tight">Your cart</h1>
        <ul className="divide-y">
          {rows.map(({ item, product }) => (
            <li key={product.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-slate-900">{product.title}</div>
                <div className="text-xs text-slate-500">Qty: {item.qty}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {((product.priceCents * item.qty) / 100).toFixed(2)} {product.currency}
                </div>
                <div className="text-xs text-slate-500">
                  {(product.priceCents / 100).toFixed(2)} {product.currency} each
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-max rounded-2xl border bg-white p-6 shadow-sm lg:sticky lg:top-20">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="font-medium">{(subtotalCents / 100).toFixed(2)} {currency}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Shipping</dt>
            <dd className="font-medium">0.00 {currency}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Tax</dt>
            <dd className="font-medium">0.00 {currency}</dd>
          </div>
          <div className="mt-3 border-t pt-3 flex justify-between text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-semibold">{(subtotalCents / 100).toFixed(2)} {currency}</dd>
          </div>
        </dl>

        <Link
          href="/checkout"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Checkout
        </Link>

        <Link
          href="/products"
          className="mt-3 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-slate-700 hover:bg-slate-50"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}