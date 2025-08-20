import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/user";

// Next.js 15: params is a Promise — await it.
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Ensure the order belongs to the user
  const order = await prisma.order.findFirst({
    where: { id, userId },
    select: { paymentStatus: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If already paid, just redirect
  if (order.paymentStatus === "PAID") {
    return NextResponse.redirect(new URL(`/orders/${id}`, req.url));
  }

  // Mark as paid (OrderStatus 'PAID' exists in your schema)
  await prisma.order.update({
    where: { id },
    data: { paymentStatus: "PAID", status: "PAID" },
  });

  return NextResponse.redirect(new URL(`/orders/${id}`, req.url));
}