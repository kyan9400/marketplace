import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/user";
import { cookies } from "next/headers";
import { StatusBadge, PaymentBadge } from "@/components/badges";

export default async function OrdersPage() {
  // make dynamic for Next 15
  const _jar = await cookies();
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Your orders</h1>
        <p className="mt-4 text-gray-600">No user id yet  place an order first.</p>
        <Link href="/products" className="mt-2 inline-block text-blue-600 hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      paymentStatus: true,
      status: true,
    },
  });

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Your orders</h1>
        <p className="mt-4 text-gray-600">You don&apos;t have any orders yet.</p>
        <Link href="/products" className="mt-2 inline-block text-blue-600 hover:underline">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Your orders</h1>
      <ul className="mt-4 divide-y rounded-xl border bg-white">
        {orders.map((o) => (
          <li key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="font-medium">Order #{o.id.slice(-6)}</div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge value={o.status as unknown as string} />
                <PaymentBadge value={o.paymentStatus as unknown as string} />
                <span className="text-gray-500">{o.createdAt.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:text-right">
              <div className="text-lg font-semibold">
                {(o.totalCents / 100).toFixed(2)} {o.currency}
              </div>
              {String(o.paymentStatus).toUpperCase() === "UNPAID" && (
                <form action={`/api/orders/${o.id}/pay`} method="POST">
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                  >
                    Pay now
                  </button>
                </form>
              )}
              <Link href={`/orders/${o.id}`} className="text-blue-600 hover:underline text-sm">
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}