// src/app/checkout/page.tsx
import { prisma } from "@/lib/db";
import { ensureUserId } from "@/lib/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Item = { id: string; qty: number };

function parseCookie(raw?: string): Item[] {
  try {
    const data = JSON.parse(raw ?? "[]");
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === "object" && (data[0] as any)?.id) {
        return data.map((x: any) => ({ id: String(x.id), qty: Math.max(1, Number(x.qty ?? 1)) }));
      }
      if (data.length && typeof data[0] === "string") {
        return Array.from(new Set(data as string[])).map((id) => ({ id, qty: 1 }));
      }
    }
  } catch {}
  return [];
}

export default async function CheckoutPage() {
  const jar = await cookies(); // ⬅️ await
  const items = parseCookie(jar.get("cart")?.value);

  if (!items.length) {
    return (
      <div className="container-page py-12">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-2 text-gray-600">Your cart is empty.</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.id) } },
    select: { id: true, title: true, priceCents: true, currency: true },
  });

  const lines = items.map((it) => {
    const p = products.find((x) => x.id === it.id)!;
    return {
      ...it,
      title: p.title,
      unit: p.priceCents,
      total: p.priceCents * it.qty,
      currency: p.currency,
    };
  });
  const subtotal = lines.reduce((a, b) => a + b.total, 0);
  const currency = lines[0]?.currency ?? "USD";

  async function placeOrder() {
    "use server";
    const jar = await cookies(); // ⬅️ await (server action context)

    const items = parseCookie(jar.get("cart")?.value);
    if (!items.length) redirect("/cart");

    const uid = await ensureUserId(jar);

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.id) } },
      select: { id: true, title: true, priceCents: true, currency: true },
    });

    const lines = items.map((it) => {
      const p = products.find((x) => x.id === it.id)!;
      return {
        productId: p.id,
        title: p.title,
        unit: p.priceCents,
        qty: it.qty,
        total: p.priceCents * it.qty,
        currency: p.currency,
      };
    });

    const subtotal = lines.reduce((a, b) => a + b.total, 0);
    const currency = lines[0]?.currency ?? "USD";

    const order = await prisma.order.create({
      data: {
        userId: uid,
        currency,
        subtotalCents: subtotal,
        totalCents: subtotal,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            titleSnapshot: l.title,
            unitPriceCents: l.unit,
            qty: l.qty,
            totalCents: l.total,
          })),
        },
      },
      select: { id: true },
    });

    // Clear cart (allowed in server action)
    jar.set("cart", "[]", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(`/orders/${order.id}`);
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <ul className="mt-6 divide-y rounded-xl border bg-white">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{l.title}</p>
              <p className="text-sm text-gray-600">Qty {l.qty}</p>
            </div>
            <div className="font-semibold">
              {(l.total / 100).toFixed(2)} {l.currency}
            </div>
          </li>
        ))}
        <li className="flex items-center justify-between p-4">
          <p className="font-semibold">Subtotal</p>
          <p className="font-semibold">
            {(subtotal / 100).toFixed(2)} {currency}
          </p>
        </li>
      </ul>

      <form action={placeOrder} className="mt-6">
        <button className="btn-primary">Place order</button>
      </form>
    </div>
  );
}
