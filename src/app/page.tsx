import Link from "next/link";

export default async function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="section relative overflow-hidden">
        {/* soft background accents */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="mb-4 leading-tight text-4xl md:text-5xl font-semibold tracking-tight">
              Find things you’ll{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                love
              </span>{" "}
              ✨
            </h1>

            <p className="text-gray-600 mb-6 text-lg">
              Hand-picked products from trusted sellers. Smooth checkout, clear
              pricing, and a delightful experience from browse to buy.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Browse products
              </Link>
              <Link href="/orders" className="btn-secondary">
                Your orders
              </Link>
              <Link href="/why-myshop" className="btn-ghost">
                Why MyShop?
              </Link>
            </div>

            {/* trust mini badges */}
            <ul className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span aria-hidden>🔒</span> Secure payments
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden>✅</span> Verified sellers
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden>⚡</span> Fast delivery
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden>💬</span> 24/7 support
              </li>
            </ul>
          </div>

          {/* decorative card / preview */}
          <div className="card p-0 overflow-hidden">
            <div className="relative h-56 md:h-80 w-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400">
              {/* floating blobs */}
              <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
              {/* mock product tiles */}
              <div className="absolute inset-4 grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white/80 backdrop-blur shadow-sm border border-white/50 hover:shadow-md transition"
                  >
                    <div className="h-16 md:h-24 w-full rounded-t-xl bg-gradient-to-br from-slate-100 to-slate-200" />
                    <div className="p-2">
                      <div className="h-3 w-2/3 rounded bg-slate-200 mb-1" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="section pt-0">
        <div className="card p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden>🏆</span> 50k+ happy customers
            </span>
            <span className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <span aria-hidden>🛍️</span> 1,200+ curated products
            </span>
            <span className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <span aria-hidden>⭐</span> 4.8/5 average rating
            </span>
            <span className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <span aria-hidden>🚚</span> Global shipping
            </span>
          </div>
        </div>
      </section>

      {/* WHY MYSHOP */}
      <section className="section">
        <div className="grid gap-6">
          <div className="card p-6 md:p-8">
            <h2 className="mb-2 text-2xl font-semibold">Why MyShop?</h2>
            <p className="text-gray-600">
              Transparent prices, curated catalog, and a checkout that feels
              effortless. Add items to your cart and try it out! We focus on
              what matters:
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: "🛡️",
                  title: "Trusted Sellers",
                  desc:
                    "Every seller is verified for quality and reliability.",
                },
                {
                  icon: "💳",
                  title: "Secure Payments",
                  desc: "Your data is protected with industry-standard security.",
                },
                {
                  icon: "📦",
                  title: "Fast Delivery",
                  desc: "Reliable shipping with real-time tracking updates.",
                },
                {
                  icon: "🤝",
                  title: "Friendly Support",
                  desc: "Help whenever you need it—before and after purchase.",
                },
              ].map((f, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
                  <div className="text-2xl mb-2" aria-hidden>
                    {f.icon}
                  </div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="card p-6 md:p-8">
          <h2 className="mb-2 text-2xl font-semibold">How it works</h2>
          <p className="text-gray-600">
            A simple journey from browsing to unboxing—made for humans.
          </p>

          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Browse & discover",
                desc:
                  "Explore categories and hand-picked collections made to inspire.",
                emoji: "🧭",
              },
              {
                step: "2",
                title: "Add to cart",
                desc:
                  "Clear pricing, no surprises. Save favorites or head to checkout.",
                emoji: "🧺",
              },
              {
                step: "3",
                title: "Track & enjoy",
                desc:
                  "Get updates as your order ships—then unbox the joy. 🎁",
                emoji: "📦",
              },
            ].map((s) => (
              <li
                key={s.step}
                className="rounded-2xl border border-gray-100 p-5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-semibold">
                    {s.step}
                  </span>
                  <span className="text-xl" aria-hidden>
                    {s.emoji}
                  </span>
                </div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex gap-3">
            <Link href="/products" className="btn-primary">
              Start shopping
            </Link>
            <Link href="/collections" className="btn-secondary">
              Explore collections
            </Link>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="section">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "Checkout was a breeze and my order arrived early. Love the curation!",
              name: "Maya",
              meta: "Verified buyer",
            },
            {
              quote:
                "Prices were exactly as shown—no hidden fees. Support was super helpful.",
              name: "Jonas",
              meta: "4 orders",
            },
            {
              quote:
                "It feels like a boutique, but online. Found gifts I couldn’t find elsewhere.",
              name: "Aisha",
              meta: "Gift hunter",
            },
          ].map((t, i) => (
            <figure key={i} className="card p-6">
              <blockquote className="text-gray-700">“{t.quote}”</blockquote>
              <figcaption className="mt-3 text-sm text-gray-500">
                — {t.name} · {t.meta}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="card p-6 md:p-8">
          <h2 className="mb-2 text-2xl font-semibold">Frequently asked</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "Do you ship internationally?",
                a: "Yes. We ship to most countries with tracked delivery options at checkout.",
              },
              {
                q: "What payment methods do you accept?",
                a: "Major cards, Apple/Google Pay, and more depending on your region.",
              },
              {
                q: "How easy are returns?",
                a: "Start a return from your Orders page—most items are returnable within 30 days.",
              },
              {
                q: "Are sellers verified?",
                a: "All sellers are vetted for quality, reliability, and service standards.",
              },
            ].map((f, i) => (
              <details
                key={i}
                className="rounded-2xl border border-gray-100 p-4 open:bg-gray-50/50"
              >
                <summary className="cursor-pointer font-medium">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section">
        <div className="card p-6 md:p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Shop with confidence 💙
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Whether it’s your first order or your fiftieth, we’re here to make
            every step joyful—from browsing to unboxing.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/products" className="btn-primary">
              Find your next favorite
            </Link>
            <Link href="/orders" className="btn-secondary">
              Track your orders
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
