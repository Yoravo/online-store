import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          store: { select: { name: true, slug: true } },
          images: { where: { is_primary: true }, take: 1 },
          variants: { orderBy: { price: "asc" }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[PRODUCTS GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
