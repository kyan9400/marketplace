import Link from "next/link";
import { getCart, removeFromCart, updateQty, clearCart } from "@/lib/cart";

export default async function CartPage() {
  const cart = await getCart();

  if (cart.items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block underline">Browse products</Link>
      </div>
    );
  }

  const currency = (cart.items[0] as any).product?.currency ?? "USD";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <ul className="space-y-4">
        {cart.items.map((it: any) => (
          <li key={`${it.productId}-${it.variantId ?? "none"}`} className="flex gap-4 border rounded p-4 bg-white">
            {it.product?.image ? (
              <img src={it.product.image} className="h-20 w-20 object-cover rounded" alt="" />
            ) : (
              <div className="h-20 w-20 grid place-items-center bg-gray-100 rounded text-xs text-gray-500">No image</div>
            )}
            <div className="flex-1">
              <Link href={`/products/${it.product?.slug}`} className="font-medium hover:underline">
                {it.product?.title ?? "Unknown product"}
              </Link>
              <div className="text-sm text-gray-500">by {it.product?.shopName}</div>

              <form action={async (formData) => {
                "use server";
                const qty = Number(formData.get("qty") ?? 1);
                await updateQty(it.productId, qty, it.variantId);
              }} className="mt-2 flex items-center gap-2">
                <input type="number" name="qty" defaultValue={it.qty} min={1} className="w-20 border rounded px-2 py-1" />
                <button className="border rounded px-3 py-1">Update</button>
              </form>

              <form action={async () => {
                "use server";
                await removeFromCart(it.productId, it.variantId);
              }} className="mt-2">
                <button className="text-red-600 text-sm underline">Remove</button>
              </form>
            </div>
            <div className="text-right font-semibold">
              ${(it.product?.priceCents! / 100).toFixed(2)} {currency}
              <div className="text-sm text-gray-600">x {it.qty}</div>
              <div className="mt-1">${(it.totalCents / 100).toFixed(2)} {currency}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xl font-semibold">
          Subtotal: ${(cart.subtotalCents / 100).toFixed(2)} {currency}
        </div>

        <form action={async () => { "use server"; await clearCart(); }}>
          <button className="rounded border px-4 py-2">Clear cart</button>
        </form>
      </div>

      <div className="mt-4">
        <Link href="/products" className="underline">Continue shopping</Link>
      </div>
    </div>
  );
}
