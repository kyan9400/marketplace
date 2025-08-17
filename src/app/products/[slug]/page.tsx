import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { shop: true },
  });

  if (!product) notFound();

  const images: string[] = (() => {
    try { return JSON.parse(product.imagesJson ?? "[]") ?? []; }
    catch { return []; }
  })();

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Link href="/products" className="text-sm text-blue-600 hover:underline">
        &larr; Back to products
      </Link>

      <h1 className="mt-2 text-2xl font-bold">{product.title}</h1>
      <p className="mt-1 text-gray-600">
        {(product.priceCents / 100).toFixed(2)} {product.currency}
      </p>
      {product.shop && (
        <p className="text-sm text-gray-500">by {product.shop.name}</p>
      )}

      <div className="prose mt-4 whitespace-pre-wrap">{product.description}</div>

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <li key={i} className="aspect-square overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </li>
          ))}
        </ul>
      )}

      <form action="/cart" method="POST" className="mt-6">
        <input type="hidden" name="productId" value={product.id} />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add to cart
        </button>
      </form>
    </div>
  );
}