import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Ensure a seller + shop exist
  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: {},
    create: { email: "seller@example.com", role: "SELLER" },
  });

  const shop = await prisma.shop.upsert({
    where: { slug: "sarahs-store" },
    update: { ownerId: seller.id },
    create: {
      ownerId: seller.id,
      name: "Sarah's Store",
      slug: "sarahs-store",
      description: "Quality goods from Sarah.",
      isApproved: true,
    },
  });

  const products = [
    { title: "Classic Tee", slug: "classic-tee", priceCents: 1999, currency: "USD", description: "Soft cotton tee for everyday wear.", images: ["https://picsum.photos/seed/tee1/800/600"] },
    { title: "Premium Hoodie", slug: "premium-hoodie", priceCents: 4999, currency: "USD", description: "Cozy fleece-lined hoodie.", images: ["https://picsum.photos/seed/hoodie1/800/600"] },
    { title: "Running Shoes", slug: "running-shoes", priceCents: 7499, currency: "USD", description: "Lightweight, responsive cushioning.", images: ["https://picsum.photos/seed/shoes1/800/600"] },
    { title: "Leather Wallet", slug: "leather-wallet", priceCents: 2999, currency: "USD", description: "Minimal bi-fold wallet.", images: ["https://picsum.photos/seed/wallet1/800/600"] },
    { title: "Stainless Bottle", slug: "stainless-bottle", priceCents: 2499, currency: "USD", description: "Keeps drinks cold 24h.", images: ["https://picsum.photos/seed/bottle1/800/600"] },
    { title: "Wireless Earbuds", slug: "wireless-earbuds", priceCents: 8999, currency: "USD", description: "ANC + long battery life.", images: ["https://picsum.photos/seed/earbuds1/800/600"] },
    { title: "Gaming Mouse", slug: "gaming-mouse", priceCents: 3999, currency: "USD", description: "High DPI optical sensor.", images: ["https://picsum.photos/seed/mouse1/800/600"] },
    { title: "Mechanical Keyboard", slug: "mech-keyboard", priceCents: 11999, currency: "USD", description: "Hot-swappable switches.", images: ["https://picsum.photos/seed/keyboard1/800/600"] },
    { title: "Desk Lamp", slug: "desk-lamp", priceCents: 3599, currency: "USD", description: "Adjustable LED task light.", images: ["https://picsum.photos/seed/lamp1/800/600"] },
    { title: "Backpack", slug: "everyday-backpack", priceCents: 6599, currency: "USD", description: "Water-resistant 20L pack.", images: ["https://picsum.photos/seed/backpack1/800/600"] },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        imagesJson: JSON.stringify(p.images),
        // status omitted -> use schema default
      },
      create: {
        shopId: shop.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        imagesJson: JSON.stringify(p.images),
        // status omitted -> use schema default
      },
    });
  }

  console.log("? Seeded extra products");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

