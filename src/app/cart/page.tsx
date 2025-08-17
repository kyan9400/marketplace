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
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="mt-4 text-gray-600">Your cart is empty.</p>
        <Link href="/products" className="mt-2 inline-block text-blue-600 hover:underline">Browse products</Link>
      </div>
    );
  }

  const ids = items.map(i => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, priceCents: true, currency: true },
  });

  const byId = new Map(products.map(p => [p.id, p]));
  const rows = items.map(i => ({ item: i, product: byId.get(i.id)! })).filter(r => !!r.product);

  const subtotalCents = rows.reduce((sum, r) => sum + r.product.priceCents * r.item.qty, 0);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Your cart</h1>
      <ul className="mt-4 divide-y rounded-lg border">
        {rows.map(({ item, product }) => (
          <li key={product.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{product.title}</div>
              <div className="text-sm text-gray-600">Qty: {item.qty}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{((product.priceCents * item.qty) / 100).toFixed(2)} {product.currency}</div>
              <div className="text-xs text-gray-500">{(product.priceCents / 100).toFixed(2)} {product.currency} each</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 text-right text-lg font-semibold">
        Subtotal: {(subtotalCents / 100).toFixed(2)} {rows[0]?.product.currency ?? "USD"}
      </div>

      <Link href="/checkout" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Checkout</Link>
    </div>
  );
}