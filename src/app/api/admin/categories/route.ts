import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const categories = await prisma.category.findMany({
      where: { parent_id: null },
      include: {
        children: { orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    logError("[ADMIN CATEGORIES GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }

  export async function POST(req: NextRequest) {
    try {
      const authUser = await getAuthUser(req);
      if (!authUser || authUser.role !== "ADMIN")
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });

      const { name, parentId } = await req.json();
      if (!name?.trim())
        return NextResponse.json(
          { message: "Nama kategori wajib diisi" },
          { status: 400 },
        );

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const exists = await prisma.category.findUnique({ where: { slug } });
      if (exists)
        return NextResponse.json(
          { message: "Kategori dengan nama serupa sudah ada" },
          { status: 409 },
        );

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          slug,
          parent_id: parentId || null,
        },
      });

      return NextResponse.json(
        { message: "Kategori berhasil dibuat", category },
        { status: 201 },
      );
    } catch (error) {
      logError("[ADMIN CATEGORIES POST]", error);
      return NextResponse.json(
        { message: "Terjadi kesalahan server" },
        { status: 500 },
      );
    }
  }
}
