// src/app/api/orders/[id]/pay/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getUserIdFromCookie, ensureUserId } from "@/lib/user";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const jar = await cookies(); // ✅ await it

    // Make sure we have a user id (guest or real)
    const uid = getUserIdFromCookie(jar) ?? (await ensureUserId(jar));

    // Only allow paying your own order
    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: uid },
      select: { id: true, paymentStatus: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    // Update statuses (matches your Prisma enums)
    await prisma.order.update({
      where: { id: params.id },
      data: {
        paymentStatus: "PAID",
        status: "PAID", // OrderStatus has PAID in your schema
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("pay route error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
