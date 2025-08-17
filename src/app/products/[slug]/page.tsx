import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { shop: true },
  });

  if (!product) notFound();

  const images: string[] = (() => {
    try { return JSON.parse(product.imagesJson ?? "[]") ?? []; } catch { return []; }
  })();

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <Link href="/products" className="text-sm text-indigo-600 hover:underline">&larr; Back to products</Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{product.title}</h1>
        <p className="mt-1 text-slate-600">
          {(product.priceCents / 100).toFixed(2)} {product.currency}
        </p>
        {product.shop && (
          <p className="text-sm text-slate-500">by {product.shop.name}</p>
        )}

        <div className="prose mt-6 max-w-none whitespace-pre-wrap">{product.description}</div>

        <form action="/api/cart" method="POST" className="mt-8 flex items-center gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <label className="text-sm text-slate-600" htmlFor="qty">Qty</label>
          <input
            id="qty"
            name="qty"
            type="number"
            defaultValue={1}
            min={1}
            className="w-20 rounded-md border px-2 py-1"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Add to cart
          </button>
        </form>
      </div>

      <div>
        {images.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {images.map((src, i) => (
              <li key={i} className="overflow-hidden rounded-xl border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="aspect-square w-full overflow-hidden rounded-2xl border bg-white" />
        )}
      </div>
    </div>
  );
}