import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ include: { shop: true } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => {
          const images = p.imagesJson ? (JSON.parse(p.imagesJson) as string[]) : [];
          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="block border rounded-lg shadow p-4 bg-white hover:shadow-md transition"
            >
              {images.length > 0 && (
                <img
                  src={images[0]}
                  alt={p.title}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <h2 className="text-lg font-semibold mt-2">{p.title}</h2>
              <p className="text-sm text-gray-600">{p.description}</p>
              <p className="text-blue-600 font-bold mt-2">
                ${(p.priceCents / 100).toFixed(2)} {p.currency}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sold by {p.shop.name}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
