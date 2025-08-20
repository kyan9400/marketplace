// src/app/api/orders/[id]/pay/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { ensureUserId } from "@/lib/user";

// NOTE: don't over-constrain the type of the 2nd arg; keep it as `context: any`
export async function POST(req: Request, context: any) {
  const id = context?.params?.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  // In Next 15, cookies() is async
  const jar = await cookies();
  const uid = await ensureUserId(jar);

  // Make sure the order belongs to the current user
  const order = await prisma.order.findFirst({
    where: { id, userId: uid },
    select: { id: true, paymentStatus: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Idempotent: if already paid, just redirect to detail
  if (order.paymentStatus === "PAID") {
    return NextResponse.redirect(new URL(`/orders/${id}`, req.url), 303);
  }

  // Update to a valid enum value from your schema (no "CONFIRMED" in schema)
  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: "PAID",
      status: "PROCESSING",
      updatedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL(`/orders/${id}`, req.url), 303);
}
