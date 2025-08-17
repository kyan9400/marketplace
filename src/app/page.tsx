import Link from "next/link";

export default async function HomePage() {
  return (
    <>
      <section className="section">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="mb-4">
              Find things you’ll <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">love</span>
            </h1>
            <p className="text-gray-600 mb-6">
              Hand-picked products from trusted sellers. Smooth checkout, clear pricing, and a delightful experience from browse to buy.
            </p>
            <div className="flex gap-3">
              <Link href="/products" className="btn-primary">Browse products</Link>
              <Link href="/orders" className="btn-secondary">Your orders</Link>
            </div>
          </div>
          <div className="card p-0 overflow-hidden">
            {/* Decorative cover */}
            <div className="h-56 md:h-72 w-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card p-6 md:p-8">
          <h2 className="mb-2">Why MyShop?</h2>
          <p className="text-gray-600">
            Transparent prices, curated catalog, and a checkout that feels effortless. Add items to your cart and try it out!
          </p>
        </div>
      </section>
    </>
  );
}
