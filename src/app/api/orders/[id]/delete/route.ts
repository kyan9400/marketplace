import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromCookie } from "@/lib/user";

// HTML forms use POST; Next.js 15: params is a Promise — await it.
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const userId = await getUserIdFromCookie();
    if (!userId) {
      const url = new URL("/orders?error=auth", req.url);
      return NextResponse.redirect(url);
    }

    // Check ownership
    const existing = await prisma.order.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.redirect(new URL("/orders?error=notfound", req.url));
    }
    if (existing.userId !== userId) {
      return NextResponse.redirect(new URL("/orders?error=forbidden", req.url));
    }

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);

    return NextResponse.redirect(new URL("/orders?deleted=1", req.url));
  } catch (err) {
    console.error("Delete order failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}