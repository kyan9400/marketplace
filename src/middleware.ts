import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.method === "POST" && req.nextUrl.pathname === "/cart") {
    return NextResponse.rewrite(new URL("/api/cart", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/cart"] };