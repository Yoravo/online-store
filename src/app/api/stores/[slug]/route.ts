import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const store = await prisma.store.findUnique({
      where: { slug, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        created_at: true,
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;
    const skip = (page - 1) * limit;
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    const where = {
      store_id: store.id,
      is_active: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          images: { where: { is_primary: true }, take: 1 },
          variants: { orderBy: { price: "asc" }, take: 1 },
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      store,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[STORE SLUG GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
