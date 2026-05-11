import { logError } from "@/src/lib/logger";
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
    logError("[DASHBOARD PRODUCTS GET ERROR]", error);
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

    if (!name || name.trim().length < 2 || name.length > 200) {
      return NextResponse.json(
        { message: "Nama produk harus 2-200 karakter" },
        { status: 400 },
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Kategori wajib dipilih" },
        { status: 400 },
      );
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { message: "Kategori tidak valid" },
        { status: 400 },
      );
    }

    if (!variants?.length) {
      return NextResponse.json(
        { message: "Minimal 1 varian produk" },
        { status: 400 },
      );
    }

    for (const v of variants) {
      if (typeof v.price !== "number" || v.price <= 0) {
        return NextResponse.json(
          { message: "Harga varian harus lebih dari 0" },
          { status: 400 },
        );
      }
      if (
        typeof v.stock !== "number" ||
        v.stock < 0 ||
        !Number.isInteger(v.stock)
      ) {
        return NextResponse.json(
          { message: "Stok harus bilangan bulat positif" },
          { status: 400 },
        );
      }
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
        name: name.trim(),
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
    logError("[DASHBOARD PRODUCTS POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
