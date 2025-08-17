import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { shop: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Products</h1>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="group rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/products/${p.slug}`} className="block p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-medium text-slate-900 transition-colors group-hover:text-indigo-600">
                  {p.title}
                </h2>
                <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {(p.priceCents / 100).toFixed(2)} {p.currency}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">by {p.shop?.name ?? "Unknown"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}