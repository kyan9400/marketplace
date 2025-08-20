import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getUserIdFromCookie } from "@/lib/user";
import { StatusBadge, PaymentBadge } from "@/components/badges";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const _jar = await cookies();
  const userId = await getUserIdFromCookie(_jar);
  
  const { id } = await params;

  if (!userId) notFound();

  const order = await prisma.order.findFirst({
    where: { id, userId },
    select: {
      id: true, createdAt: true, status: true, paymentStatus: true,
      currency: true, subtotalCents: true, totalCents: true
    },
  });

  if (!order) notFound();

  const items = await prisma.orderItem.findMany({
    where: { orderId: id },
    select: { id: true, titleSnapshot: true, unitPriceCents: true, qty: true, totalCents: true },
  });

  const unpaid = String(order.paymentStatus).toUpperCase() === "UNPAID";

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link href="/orders" className="text-sm text-blue-600 hover:underline">&larr; Back to orders</Link>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(-6)}</h1>
          <div className="mt-1 text-gray-600">{order.createdAt.toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge value={order.status as unknown as string} />
          <PaymentBadge value={order.paymentStatus as unknown as string} />
          {unpaid && (
            <form action={`/api/orders/${order.id}/pay`} method="POST" className="ml-2">
              <button type="submit" className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
                Pay now
              </button>
            </form>
          )}
        </div>
      </div>

      <ul className="mt-6 divide-y rounded-xl border bg-white">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{it.titleSnapshot}</div>
              <div className="text-sm text-gray-500">Qty: {it.qty}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {(it.totalCents / 100).toFixed(2)} {order.currency}
              </div>
              <div className="text-xs text-gray-500">
                {(it.unitPriceCents / 100).toFixed(2)} {order.currency} each
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-end">
        <div className="rounded-lg border p-4 w-full max-w-sm bg-white">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{(order.subtotalCents / 100).toFixed(2)} {order.currency}</span>
          </div>
          <div className="mt-2 border-t pt-2 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{(order.totalCents / 100).toFixed(2)} {order.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}