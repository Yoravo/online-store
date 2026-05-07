import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { productId, orderId, rating, comment } = await req.json();

    if (!productId || !orderId || !rating)
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 },
      );

    if (rating < 1 || rating > 5)
      return NextResponse.json(
        { message: "Rating harus antara 1-5" },
        { status: 400 },
      );

    // Validasi: order harus DELIVERED dan milik user ini
    const order = await prisma.order.findFirst({
      where: { id: orderId, user_id: authUser.id, status: "DELIVERED" },
      include: {
        items: {
          include: { variant: { select: { product_id: true } } },
        },
      },
    });

    if (!order)
      return NextResponse.json(
        { message: "Order tidak ditemukan atau belum selesai" },
        { status: 404 },
      );

    // Validasi: produk harus ada di order ini
    const productInOrder = order.items.some(
      (item) => item.variant.product_id === productId,
    );
    if (!productInOrder)
      return NextResponse.json(
        { message: "Produk tidak ada dalam order ini" },
        { status: 400 },
      );

    // Cek sudah review belum
    const existing = await prisma.review.findUnique({
      where: {
        user_id_product_id_order_id: {
          user_id: authUser.id,
          product_id: productId,
          order_id: orderId,
        },
      },
    });
    if (existing)
      return NextResponse.json(
        { message: "Kamu sudah memberi ulasan untuk produk ini" },
        { status: 409 },
      );

    const review = await prisma.review.create({
      data: {
        user_id: authUser.id,
        product_id: productId,
        order_id: orderId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      { message: "Ulasan berhasil dikirim", review },
      { status: 201 },
    );
  } catch (error) {
    console.error("[REVIEW POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
