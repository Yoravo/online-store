import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "12")),
      50,
    );
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";
    const skip = (page - 1) * limit;

    const where = {
      is_active: true,
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(category && {
        category: { slug: category },
      }),
    };

    const orderBy = { created_at: "desc" as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { name: true, slug: true } },
          store: { select: { name: true, slug: true } },
          images: { where: { is_primary: true }, take: 1 },
          variants: { orderBy: { price: "asc" }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const sorted =
      sort === "price_asc"
        ? products.sort(
            (a, b) =>
              Number(a.variants[0]?.price ?? 0) -
              Number(b.variants[0]?.price ?? 0),
          )
        : sort === "price_desc"
          ? products.sort(
              (a, b) =>
                Number(b.variants[0]?.price ?? 0) -
                Number(a.variants[0]?.price ?? 0),
            )
          : products;

    return NextResponse.json({
      products: sorted,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logError("[PRODUCTS GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
