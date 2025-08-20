import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/user";

// POST /api/orders/[id]/pay
type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const uid = await getUserIdFromCookie();

  // Always go back to the order detail
  const toOrder = (reqUrl: string) => new URL(`/orders/${id}`, reqUrl);

  if (!uid || !id) {
    return NextResponse.redirect(new URL("/orders", _req.url), { status: 303 });
  }

  // Ensure the order belongs to this user and is currently UNPAID
  const order = await prisma.order.findFirst({
    where: { id, userId: uid },
    select: { id: true, paymentStatus: true },
  });

  if (!order) {
    return NextResponse.redirect(new URL("/orders", _req.url), { status: 303 });
  }

  if (order.paymentStatus === "PAID") {
    // Nothing to do  already paid.
    return NextResponse.redirect(toOrder(_req.url), { status: 303 });
  }

  try {
    // Flip paymentStatus to PAID. Do NOT touch `status` unless you're sure of the enum value.
    await prisma.order.update({
      where: { id },
      data: { paymentStatus: "PAID" },
    });
  } catch (err) {
    console.error("pay route error", err);
    return NextResponse.redirect(toOrder(_req.url), { status: 303 });
  }

  return NextResponse.redirect(toOrder(_req.url), { status: 303 });
}