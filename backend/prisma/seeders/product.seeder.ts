import type { PrismaClient } from "../../src/generated/prisma/client.js";

const products = [
  {
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    description:
      "Comfortable wireless headphones with immersive sound and long battery life.",
    price: 79.99,
    stock: 25,
    imageUrl: "/uploads/products/wireless-headphones.webp",
    categorySlug: "electronics",
  },
  {
    name: "Mechanical Keyboard",
    slug: "mechanical-keyboard",
    description:
      "A mechanical keyboard designed for responsive typing and everyday productivity.",
    price: 89.99,
    stock: 18,
    imageUrl: "/uploads/products/mechanical-keyboard.webp",
    categorySlug: "electronics",
  },
  {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-t-shirt",
    description:
      "A versatile cotton T-shirt with a comfortable fit for everyday wear.",
    price: 19.99,
    stock: 40,
    imageUrl: "/uploads/products/classic-cotton-t-shirt.webp",
    categorySlug: "clothing",
  },
  {
    name: "Everyday Backpack",
    slug: "everyday-backpack",
    description:
      "A practical backpack with multiple compartments for work, study, and travel.",
    price: 49.99,
    stock: 15,
    imageUrl: "/uploads/products/everyday-backpack.webp",
    categorySlug: "clothing",
  },
  {
    name: "Ceramic Coffee Mug",
    slug: "ceramic-coffee-mug",
    description:
      "A durable ceramic mug suitable for your morning coffee or afternoon tea.",
    price: 12.5,
    stock: 50,
    imageUrl: "/uploads/products/ceramic-coffee-mug.webp",
    categorySlug: "home-kitchen",
  },
  {
    name: "Stainless Steel Water Bottle",
    slug: "stainless-steel-water-bottle",
    description:
      "A reusable stainless steel water bottle for daily use and outdoor activities.",
    price: 24.99,
    stock: 30,
    imageUrl: "/uploads/products/stainless-steel-water-bottle.webp",
    categorySlug: "sports-outdoors",
  },
  {
    name: "Beginner's Guide to Programming",
    slug: "beginners-guide-to-programming",
    description:
      "An introductory book covering programming fundamentals and problem-solving.",
    price: 29.99,
    stock: 12,
    imageUrl: "/uploads/products/programming-book.webp",
    categorySlug: "books",
  },
  {
    name: "Daily Skincare Set",
    slug: "daily-skincare-set",
    description:
      "A simple skincare set designed for a consistent daily personal-care routine.",
    price: 34.99,
    stock: 20,
    imageUrl: "/uploads/products/daily-skincare-set.webp",
    categorySlug: "beauty-personal-care",
  },
  {
    name: "Board Game Collection",
    slug: "board-game-collection",
    description:
      "A family-friendly collection of board games for game nights and gatherings.",
    price: 39.99,
    stock: 14,
    imageUrl: "/uploads/products/board-game-collection.webp",
    categorySlug: "toys-games",
  },
  {
    name: "USB-C Charging Hub",
    slug: "usb-c-charging-hub",
    description:
      "A compact USB-C hub for connecting compatible devices and everyday peripherals.",
    price: 44.99,
    stock: 22,
    imageUrl: "/uploads/products/usb-c-charging-hub.webp",
    categorySlug: "electronics",
  },
];

export async function seedProducts(prisma: PrismaClient) {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
    },
  });

  const categoryIds = new Map(
    categories.map((category) => [category.slug, category.id]),
  );

  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(
        `Category "${product.categorySlug}" not found. Seed categories first.`,
      );
    }

    const { categorySlug, ...productData } = product;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...productData,
        categoryId,
        isActive: true,
      },
      create: {
        ...productData,
        categoryId,
        isActive: true,
      },
    });
  }

  console.log(`${products.length} products seeded successfully.`);
}
