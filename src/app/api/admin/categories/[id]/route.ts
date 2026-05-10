import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { name } = await req.json();

    if (!name?.trim())
      return NextResponse.json(
        { message: "Nama kategori wajib diisi" },
        { status: 400 },
      );

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category)
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 },
      );

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const duplicate = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (duplicate)
      return NextResponse.json(
        { message: "Kategori dengan nama serupa sudah ada" },
        { status: 409 },
      );

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.trim(), slug },
    });

    return NextResponse.json({
      message: "Kategori berhasil diupdate",
      category: updated,
    });
  } catch (error) {
    console.error("[ADMIN CATEGORY PATCH]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true, products: { select: { id: true }, take: 1 } },
    });
    if (!category)
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 },
      );

    if (category.children.length > 0)
      return NextResponse.json(
        { message: "Hapus sub-kategori terlebih dahulu" },
        { status: 400 },
      );

    if (category.products.length > 0)
      return NextResponse.json(
        { message: "Kategori masih memiliki produk" },
        { status: 400 },
      );

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("[ADMIN CATEGORY DELETE]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
    