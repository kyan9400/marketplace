"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { getUserIdFromCookie } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteOrderAction(formData: FormData) {
  const orderId = formData.get("orderId");
  const redirectTo = formData.get("redirectTo");

  if (typeof orderId !== "string" || orderId.length === 0) {
    throw new Error("Missing orderId");
  }

  const jar = await cookies();
  const userId = await getUserIdFromCookie(jar);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Make sure the order exists, belongs to the user and is UNPAID
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, paymentStatus: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }
  if (order.paymentStatus !== "UNPAID") {
    throw new Error("Only UNPAID orders can be deleted");
  }

  // Delete children first to avoid FK issues
  await prisma.orderItem.deleteMany({ where: { orderId } });
  await prisma.order.delete({ where: { id: orderId } });

  // Revalidate pages
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);

  if (typeof redirectTo === "string" && redirectTo.length > 0) {
    redirect(redirectTo);
  }
}
