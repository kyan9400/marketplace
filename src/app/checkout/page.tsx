import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { ensureUserId } from "@/lib/user";

// Parse our cart cookie (supports legacy array of ids or [{id,qty}])
function parseCookie(raw?: string): { id: string; qty: number }[] {
  try {
    const data = JSON.parse(raw ?? "[]");
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === "object" && (data[0] as any)?.id) {
        return data.map((x: any) => ({ id: String(x.id), qty: Math.max(1, Number(x.qty ?? 1)) }));
      }
      if (data.length && typeof data[0] === "string") {
        return Array.from(new Set(data as string[])).map((id) => ({ id: String(id), qty: 1 }));
      }
    }
  } catch {}
  return [];
}

export default async function CheckoutPage() {
  async function action(formData: FormData) {
    "use server";
    const jar = await cookies();
    const items = parseCookie(jar.get("cart")?.value);
    if (!items.length) redirect("/cart");

    // Make sure we have a user id + row in DB
    const userId = await ensureUserId();

    // Load products and build rows
    const ids = items.map(i => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, priceCents: true, currency: true },
    });
    const byId = new Map(products.map(p => [p.id, p]));
    const rows = items
      .map(i => ({ item: i, product: byId.get(i.id) }))
      .filter(r => !!r.product) as { item: {id:string; qty:number}, product: {id:string; title:string; priceCents:number; currency:string} }[];

    if (!rows.length) redirect("/cart");

    const subtotalCents = rows.reduce((sum, r) => sum + r.product.priceCents * r.item.qty, 0);
    const currency = rows[0]!.product.currency;

    // Create order + items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          paymentStatus: "UNPAID",
          currency,
          subtotalCents,
          discountCents: 0,
          shippingCents: 0,
          taxCents: 0,
          totalCents: subtotalCents,
        },
        select: { id: true },
      });

      await tx.orderItem.createMany({
        data: rows.map(({ item, product }) => ({
          orderId: o.id,
          productId: product.id,
          titleSnapshot: product.title,
          unitPriceCents: product.priceCents,
          qty: item.qty,
          totalCents: product.priceCents * item.qty,
        })),
      });

      return o;
    });

    // Clear cart cookie, then go to order detail
    jar.set("cart", "[]", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    redirect(`/orders/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="mt-3 text-gray-600">Click the button below to place your order.</p>
      <form action={action} className="mt-6">
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Place order
        </button>
      </form>
      <Link href="/cart" className="mt-4 block text-blue-600 hover:underline">&larr; Back to cart</Link>
    </div>
  );
}