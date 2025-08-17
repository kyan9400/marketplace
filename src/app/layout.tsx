import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 antialiased">
        <header className="sticky top-0 z-40 border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="font-semibold tracking-tight text-slate-900">
              <span className="inline-block rounded-xl bg-indigo-600 px-2 py-1 text-white shadow-sm">MyShop</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
              <Link href="/cart" className="hover:text-indigo-600 transition-colors">Cart</Link>
              <Link href="/orders" className="hover:text-indigo-600 transition-colors">Orders</Link>
              <Link href="/account" className="hover:text-indigo-600 transition-colors">Account</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </body>
    </html>
  );
}