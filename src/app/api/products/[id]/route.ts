import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import {
  getAuthUser,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/src/lib/api-auth";

// GET - /api/products/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        is_active: true,
      },
      include: {
        category: { select: { name: true, slug: true } },
        store: { select: { id: true, name: true, slug: true, logo: true } },
        images: true,
        variants: { orderBy: { price: "asc" } },
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { created_at: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length
        : 0;

    return NextResponse.json({ product, avgRating });
  } catch (error) {
    console.error("[PRODUCT GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
// PATCH - /api/products/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return unauthorizedResponse();
    if (authUser.role !== "SELLER") return forbiddenResponse();

    const { id } = await params;
    const body = await req.json();
    const { name, description, categoryId, isActive, variants } = body;

    // make sure the product exists to exact seller
    const existing = await prisma.product.findFirst({
      where: { id, store: { user_id: authUser.id } },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    // update product
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }),
        ...(description !== undefined && { description }),
        ...(categoryId !== undefined && { category_id: categoryId }),
        ...(isActive !== undefined && { is_active: isActive }),
      },
    });

    // update variants if sent
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              price: v.price,
              stock: v.stock,
              sku: v.sku || undefined,
            },
          });
        }
      }
    }
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("[PRODUCT PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE - /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return unauthorizedResponse();
    if (authUser.role !== "SELLER") return forbiddenResponse();
    const { id } = await params;
    // make sure the product exists to exact seller
    const existing = await prisma.product.findFirst({
      where: { id, store: { user_id: authUser.id } },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }
    // Soft delete - update is_active
    await prisma.product.update({
      where: { id },
      data: { is_active: false },
    });
    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("[PRODUCT DELETE ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
