"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-semibold">MyShop</Link>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline">Products</Link>
          <Link href="/cart" className="hover:underline">Cart</Link>
        </div>
      </nav>
    </header>
  );
}
