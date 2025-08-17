"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, PackageSearch, ListOrdered, UserRound } from "lucide-react";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`btn-ghost rounded-lg ${active ? "bg-gray-100" : ""}`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/70 backdrop-blur">
      <nav className="container-page h-14 flex items-center gap-3">
        <Link
          href="/"
          className="mr-2 select-none rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1.5 text-white font-semibold shadow-sm"
        >
          MyShop
        </Link>

        <div className="ml-auto flex items-center gap-1 text-sm">
          <NavLink href="/products"><PackageSearch className="mr-2 h-4 w-4" />Products</NavLink>
          <NavLink href="/cart"><ShoppingCart className="mr-2 h-4 w-4" />Cart</NavLink>
          <NavLink href="/orders"><ListOrdered className="mr-2 h-4 w-4" />Orders</NavLink>
          <NavLink href="/account"><UserRound className="mr-2 h-4 w-4" />Account</NavLink>
        </div>
      </nav>
    </header>
  );
}
