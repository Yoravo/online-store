import type { MetadataRoute } from "next";
import prisma from "@/src/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://tokoku.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, stores] = await Promise.all([
    prisma.product.findMany({
      where: { is_active: true },
      select: { slug: true, updated_at: true },
      take: 5000,
    }),
    prisma.store.findMany({
      where: { status: "ACTIVE", is_active: true },
      select: { slug: true, updated_at: true },
    }),
  ]);

  return [
    { url: BASE_URL, lastModified: new Date(), priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), priority: 0.9 },
    ...products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updated_at,
      priority: 0.8,
    })),
    ...stores.map((s) => ({
      url: `${BASE_URL}/stores/${s.slug}`,
      lastModified: s.updated_at,
      priority: 0.6,
    })),
  ];
}
