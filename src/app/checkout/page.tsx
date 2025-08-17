import Link from "next/link";
import { getCart } from "@/lib/cart";
import { placeOrder } from "@/lib/orders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  const cart = await getCart();

  if (!session?.user) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="mb-3">You need to sign in to place your order.</p>
        <Link href="/signin" className="underline">Go to sign in</Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty.</p>
        <Link href="/products" className="underline mt-2 inline-block">Browse products</Link>
      </div>
    );
  }

  const currency = (cart.items[0] as any)?.product?.currency ?? "USD";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order summary</h1>

      <ul className="space-y-3 mb-6">
        {cart.items.map((it: any) => (
          <li key={`${it.productId}-${it.variantId ?? "none"}`} className="flex items-start justify-between">
            <div>
              <div className="font-medium">{it.product?.title ?? "Item"}</div>
              {it.variantLabel && <div className="text-xs text-gray-600">Variant: {it.variantLabel}</div>}
              <div className="text-sm text-gray-600">Qty: {it.qty}</div>
            </div>
            <div className="font-semibold">
              ${(it.totalCents / 100).toFixed(2)} {currency}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-xl font-semibold">
          Total: ${(cart.subtotalCents / 100).toFixed(2)} {currency}
        </div>
        <form action={async () => { "use server"; await placeOrder(); }}>
          <button className="rounded bg-black px-5 py-2 text-white">Place order</button>
        </form>
      </div>

      <div className="mt-4">
        <Link href="/cart" className="underline">Back to cart</Link>
      </div>
    </div>
  );
}