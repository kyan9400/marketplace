# Marketplace

Next.js multi-vendor marketplace (work in progress).

A learning project that implements the storefront half of a marketplace: a product
catalogue backed by PostgreSQL, a cookie-based cart, a checkout that turns the cart
into an order, and an order history where orders can be marked as paid or deleted.
The Prisma schema already models shops, categories, product variants, addresses and
reviews for the seller/admin side that is not built yet.

## Stack

- [Next.js 15.4](https://nextjs.org/) (App Router, server actions, Turbopack in dev) and React 19
- TypeScript
- [Prisma 6](https://www.prisma.io/) with PostgreSQL (client generated into `src/generated/prisma`)
- Tailwind CSS 3 (`tailwind.config.js`, `postcss.config.js`)
- NextAuth v4 route at `/api/auth/*` (credentials provider, development only)

## What works today

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/products` | Product list from the database |
| `/products/[slug]` | Product detail with an "Add to cart" form |
| `/cart` | Cart contents (stored in an httpOnly `cart` cookie) |
| `/checkout` | Creates an `Order` with `OrderItem`s from the cart, then clears the cart |
| `/orders`, `/orders/[id]` | Order history for the signed-in user, with "Mark as paid" and "Delete" |
| `/signin`, `/signup`, `/account` | Email-only sign-in that creates the user on first use |
| `POST /api/cart` | Adds a product to the cart cookie |
| `POST /api/orders/[id]/pay`, `POST /api/orders/[id]/delete` | Order actions used by the forms above |

## Requirements

- Node.js 18.18 or newer (20+ recommended)
- A PostgreSQL database

## Getting started

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and NEXTAUTH_SECRET
npx prisma generate         # generates the client into src/generated/prisma
npx prisma db push          # creates the tables (or: npx prisma migrate dev --name init)
npx prisma db seed          # one seller, one shop and ten sample products
npm run dev
```

Then open <http://localhost:3000>.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Production build (`npx prisma generate` must have run first) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint via `next lint` |
| `npx prisma db seed` | Run `prisma/seed.ts` with `tsx` |

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string used by Prisma |
| `NEXTAUTH_SECRET` (or `AUTH_SECRET`) | for `/api/auth` | Secret for NextAuth JWT sessions |
| `NEXTAUTH_URL` | in production | Public base URL of the site, used by NextAuth v4 |

## Status and known limitations

This is a work-in-progress learning project and is **not ready for production**:

- Authentication is intentionally minimal: `/signin` accepts any email address with no
  password and creates the account on the spot (`src/lib/user.ts`). The NextAuth
  credentials provider in `src/lib/auth.ts` behaves the same way. Replace both with a
  real provider (OAuth, magic link or hashed passwords) before deploying.
- "Mark as paid" only flips the order status; there is no payment provider integration.
- No seller dashboard, categories, variants or reviews UI yet, although the schema
  supports them. The "Explore collections" link on the home page points to a route
  that does not exist yet.
- Shipping and tax are not calculated (both are shown as 0.00).

## License

MIT - see [LICENSE](LICENSE).
