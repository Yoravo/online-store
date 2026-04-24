import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// GET — detail produk
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const product = await prisma.product.findFirst({
      where: { id, store_id: store.id },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });

    if (!product)
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[DASHBOARD PRODUCT GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PATCH — update produk
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const product = await prisma.product.findFirst({
      where: { id, store_id: store.id },
    });
    if (!product)
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );

    const { name, description, categoryId, isActive } = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        category_id: categoryId,
        is_active: isActive,
      },
    });

    return NextResponse.json({
      message: "Produk berhasil diupdate",
      product: updated,
    });
  } catch (error) {
    console.error("[DASHBOARD PRODUCT PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE — hapus produk
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const product = await prisma.product.findFirst({
      where: { id, store_id: store.id },
    });
    if (!product)
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );

    // Hapus variant & images dulu
    await prisma.productVariant.deleteMany({ where: { product_id: id } });
    await prisma.productImage.deleteMany({ where: { product_id: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("[DASHBOARD PRODUCT DELETE ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
