import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true, // titleSnapshot, unitPriceCents, qty, totalCents, productId, etc.
      shop: true,
    },
  });

  if (!order) notFound();

  const currency = order.currency ?? "USD";
  const money = (cents: number) => (cents / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/orders" className="text-sm text-indigo-600 hover:underline">
            &larr; Back to orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Order #{order.id}</h1>
          <p className="text-sm text-slate-600">
            {order.status}  {order.paymentStatus}  {new Date(order.createdAt).toLocaleString()}
          </p>
          {order.shop && <p className="text-xs text-slate-500">Shop: {order.shop.name}</p>}
        </div>
        <div className="rounded-lg border bg-white px-3 py-2 text-right">
          <div className="text-xs text-slate-500">Total</div>
          <div className="text-lg font-semibold">
            {money(order.totalCents)} {currency}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <h2 className="px-6 pt-6 text-lg font-semibold">Items</h2>
        <ul className="divide-y">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium text-slate-900">{it.titleSnapshot ?? "Item"}</div>
                <div className="text-xs text-slate-500">
                  Qty: {it.qty}  {(it.unitPriceCents / 100).toFixed(2)} {currency} each
                </div>
              </div>
              <div className="text-right font-semibold">
                {money(it.totalCents)} {currency}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Subtotal</div>
          <div className="text-base font-semibold">{money(order.subtotalCents)} {currency}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Shipping</div>
          <div className="text-base font-semibold">{money(order.shippingCents)} {currency}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-slate-500">Tax</div>
          <div className="text-base font-semibold">{money(order.taxCents)} {currency}</div>
        </div>
      </div>
    </div>
  );
}