import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Your orders</h1>
        <p className="mb-3">Please sign in to view your orders.</p>
        <Link href="/signin" className="underline">Go to sign in</Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Your orders</h1>
        <p>You have no orders yet.</p>
        <Link href="/products" className="underline mt-2 inline-block">Browse products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your orders</h1>
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="flex items-center justify-between border rounded p-3 bg-white">
            <div>
              <div className="font-medium">Order #{o.id.slice(-6)}</div>
              <div className="text-xs text-gray-600">
                Placed {new Date(o.createdAt as unknown as string).toLocaleString()}  {o.items.length} items
              </div>
            </div>
            <Link href={`/orders/${o.id}`} className="underline text-sm">View details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}