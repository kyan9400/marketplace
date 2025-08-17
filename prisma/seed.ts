import { prisma } from "../src/lib/db";

async function main() {
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: { email: "buyer@example.com", name: "John Buyer", role: "BUYER" },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: {},
    create: {
      email: "seller@example.com",
      name: "Sarah Seller",
      role: "SELLER",
      shops: {
        create: {
          name: "Sarah's Store",
          slug: "sarah-store",
          description: "A demo shop with awesome items",
          isApproved: true,
        },
      },
    },
    include: { shops: true },
  });

  await prisma.product.upsert({
    where: { slug: "demo-tshirt" },
    update: {},
    create: {
      shopId: seller.shops[0].id,
      title: "Demo T-Shirt",
      slug: "demo-tshirt",
      description: "A simple demo T-shirt",
      priceCents: 1999,
      currency: "USD",
      imagesJson: JSON.stringify([
        "https://via.placeholder.com/400x400.png?text=Demo+T-Shirt",
      ]),
      status: "PUBLISHED",
    },
  });

  console.log("✅ Database seeded with demo data");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
