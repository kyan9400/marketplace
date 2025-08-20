import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/user";

function money(cents: number, currency = "USD") {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency });
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserIdFromCookie();
  if (!userId) notFound();

  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: { include: { product: true, variant: true }, orderBy: { id: "asc" } },
      shipping: true,
      billing: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="section">
      <div className="flex items-center justify-between">
        <h1>Order {order.id.slice(0, 8)}…</h1>
        <div className="flex gap-2">
          {order.paymentStatus !== "PAID" && (
            <form action={`/api/orders/${order.id}/pay`} method="POST">
              <button type="submit" className="btn-ghost text-green-700">Mark as Paid</button>
            </form>
          )}
          <form action={`/api/orders/${order.id}/delete`} method="POST">
            <button type="submit" className="btn-ghost text-red-600">Delete</button>
          </form>
          <Link href="/orders" className="btn-secondary">Back to orders</Link>
        </div>
      </div>

      <div className="mt-6 card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-medium">{order.status}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Payment</div>
            <div className="font-medium">{order.paymentStatus}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total</div>
            <div className="font-medium">{money(order.totalCents, order.currency || "USD")}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 card p-4">
        <h3 className="mb-2">Items</h3>
        <ul className="space-y-2">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <div className="text-gray-800">
                {it.titleSnapshot} {it.skuSnapshot ? <span className="text-gray-500">({it.skuSnapshot})</span> : null}
              </div>
              <div className="text-gray-700">x{it.qty}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}