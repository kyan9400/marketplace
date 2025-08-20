import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/user";

function money(cents: number, currency = "USD") {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency });
}

export default async function OrdersPage() {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return (
      <div className="section">
        <h1>Your Orders</h1>
        <p className="mt-4 text-gray-700">Please sign in to view your orders.</p>
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
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  return (
    <div className="section">
      <h1>Your Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-gray-700">You don&apos;t have any orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Order</th>
                <th className="py-2">Placed</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2">Payment</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-gray-200">
                  <td className="py-3">
                    <Link className="text-blue-600 hover:text-blue-700" href={`/orders/${o.id}`}>
                      {o.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="py-3">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-3">{money(o.totalCents, o.currency || "USD")}</td>
                  <td className="py-3">{o.status}</td>
                  <td className="py-3">{o.paymentStatus}</td>
                  <td className="py-3 space-x-2">
                    {o.paymentStatus !== "PAID" && (
                      <form action={`/api/orders/${o.id}/pay`} method="POST" className="inline">
                        <button type="submit" className="btn-ghost text-green-700">Mark as Paid</button>
                      </form>
                    )}
                    <form action={`/api/orders/${o.id}/delete`} method="POST" className="inline">
                      <button type="submit" className="btn-ghost text-red-600">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}