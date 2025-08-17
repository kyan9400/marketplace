import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { shop: true }});

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <Link href={`/products/${p.slug}`} className="font-medium hover:underline">
              {p.title}
            </Link>
            <div className="mt-1 text-sm text-gray-600">
              {(p.priceCents / 100).toFixed(2)} {p.currency}
            </div>
            {p.shop && (
              <div className="mt-1 text-xs text-gray-500">by {p.shop.name}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}