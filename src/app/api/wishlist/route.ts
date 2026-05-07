import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// GET — ambil semua wishlist user
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const wishlists = await prisma.wishlist.findMany({
      where: { user_id: authUser.id },
      orderBy: { created_at: "desc" },
      include: {
        product: {
          include: {
            images: { where: { is_primary: true }, take: 1 },
            variants: { orderBy: { price: "asc" }, take: 1 },
            store: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ wishlists });
  } catch (error) {
    console.error("[WISHLIST GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST — toggle wishlist (add/remove)
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId)
      return NextResponse.json(
        { message: "productId wajib diisi" },
        { status: 400 },
      );

    const existing = await prisma.wishlist.findUnique({
      where: {
        user_id_product_id: { user_id: authUser.id, product_id: productId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({
        wishlisted: false,
        message: "Dihapus dari wishlist",
      });
    }

    await prisma.wishlist.create({
      data: { user_id: authUser.id, product_id: productId },
    });

    return NextResponse.json({
      wishlisted: true,
      message: "Ditambahkan ke wishlist",
    });
  } catch (error) {
    console.error("[WISHLIST POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
