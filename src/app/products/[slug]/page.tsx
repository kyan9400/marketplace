import { prisma } from "@/lib/db";
import { addToCart } from "@/lib/cart";
import Link from "next/link";

type Props = { params: { slug: string } };

export default async function ProductDetail({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { shop: true, variants: true },
  });

  if (!product) {
    return (
      <div className="p-8">
        <p className="mb-4">Product not found.</p>
        <Link href="/products" className="underline">Back to products</Link>
      </div>
    );
  }

  const images = product.imagesJson ? (JSON.parse(product.imagesJson) as string[]) : [];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        {images.length > 0 ? (
          <img src={images[0]} alt={product.title} className="w-full rounded border object-cover" />
        ) : (
          <div className="aspect-square w-full rounded border grid place-items-center text-sm text-gray-500">No image</div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-2xl font-semibold mt-4">
          ${(product.priceCents / 100).toFixed(2)} {product.currency}
        </p>
        <p className="text-sm text-gray-500 mt-1">Sold by {product.shop.name}</p>

        <div className="mt-8 flex gap-3 items-center">
          <form action={addToCart} className="flex items-center gap-2">
            <input type="hidden" name="productId" value={product.id} />
            <input type="number" name="qty" min={1} defaultValue={1} className="w-20 border rounded px-2 py-1" />
            <button className="rounded bg-black px-4 py-2 text-white">Add to cart</button>
          </form>
          <Link href="/cart" className="rounded border px-4 py-2">View cart</Link>
        </div>
      </div>
    </div>
  );
}
