import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], stores: [] });
  }

  // Sanitize input for SQL
  const query = q.replace(/[%_\\]/g, "\\$&");

  try {
    // Fuzzy search menggunakan pg_trgm similarity
    const [products, stores] = await Promise.all([
      prisma.$queryRaw<
        { id: string; name: string; slug: string; image: string | null; price: number | null; store_name: string }[]
      >`
        SELECT p.id, p.name, p.slug,
          (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image,
          (SELECT price FROM product_variants WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as price,
          s.name as store_name
        FROM products p
        JOIN stores s ON s.id = p.store_id
        WHERE p.is_active = true
          AND (
            p.name ILIKE '%' || ${query} || '%'
            OR similarity(p.name, ${query}) > 0.2
          )
        ORDER BY similarity(p.name, ${query}) DESC, p.name ILIKE '%' || ${query} || '%' DESC
        LIMIT 5
      `,
      prisma.$queryRaw<
        { id: string; name: string; slug: string; logo: string | null }[]
      >`
        SELECT id, name, slug, logo
        FROM stores
        WHERE is_active = true AND status = 'ACTIVE'
          AND (
            name ILIKE '%' || ${query} || '%'
            OR similarity(name, ${query}) > 0.2
          )
        ORDER BY similarity(name, ${query}) DESC
        LIMIT 3
      `,
    ]);

    return NextResponse.json({ products, stores });
  } catch {
    // Fallback tanpa pg_trgm (kalau extension belum di-enable)
    const [products, stores] = await Promise.all([
      prisma.product.findMany({
        where: {
          is_active: true,
          name: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          images: { where: { is_primary: true }, take: 1, select: { url: true } },
          variants: { orderBy: { price: "asc" }, take: 1, select: { price: true } },
          store: { select: { name: true } },
        },
        take: 5,
      }),
      prisma.store.findMany({
        where: {
          is_active: true,
          status: "ACTIVE",
          name: { contains: query, mode: "insensitive" },
        },
        select: { id: true, name: true, slug: true, logo: true },
        take: 3,
      }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0]?.url || null,
        price: p.variants[0] ? Number(p.variants[0].price) : null,
        store_name: p.store.name,
      })),
      stores,
    });
  }
}
