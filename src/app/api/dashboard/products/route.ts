import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (authUser.role !== "SELLER" && authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const products = await prisma.product.findMany({
      where: { store_id: store.id },
      include: {
        category: { select: { name: true } },
        variants: true,
        images: { where: { is_primary: true }, take: 1 },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[DASHBOARD PRODUCTS GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (authUser.role !== "SELLER" && authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const { name, description, categoryId, isActive, variants, images } =
      await req.json();

    if (!name || !categoryId || !variants?.length) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const existingSlug = await prisma.product.findUnique({
      where: { slug: baseSlug },
    });
    const slug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;

    const product = await prisma.product.create({
      data: {
        store_id: store.id,
        category_id: categoryId,
        name,
        slug,
        description,
        is_active: isActive ?? true,
        variants: {
          create: variants.map(
            (v: {
              name: string;
              price: number;
              stock: number;
              sku?: string;
            }) => ({
              name: v.name || "Default",
              price: v.price,
              stock: v.stock,
              sku: v.sku || null,
            }),
          ),
        },
        images: images?.length
          ? {
              create: images.map(
                (img: { url: string; isPrimary: boolean }) => ({
                  url: img.url,
                  is_primary: img.isPrimary,
                }),
              ),
            }
          : undefined,
      },
    });

    return NextResponse.json(
      { message: "Produk berhasil dibuat", product },
      { status: 201 },
    );
  } catch (error) {
    console.error("[DASHBOARD PRODUCTS POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
