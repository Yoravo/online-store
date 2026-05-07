import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";
import { OrderStatus } from "@/src/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (authUser.role !== "SELLER" && authUser.role !== "ADMIN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: {
        store_id: store.id,
        ...(statusParam ? { status: statusParam as OrderStatus } : {}),
      },
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        address: {
          select: { recipient: true, city: true, province: true },
        },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const STATUS_LABEL: Record<string, string> = {
      PENDING: "Menunggu",
      WAITING_PAYMENT: "Menunggu Pembayaran",
      PAID: "Dibayar",
      PROCESSING: "Diproses",
      SHIPPED: "Dikirim",
      DELIVERED: "Selesai",
      CANCELLED: "Dibatalkan",
      REFUNDED: "Dikembalikan",
    };

    const formatted = orders.map((o) => ({
      id: o.id,
      status: o.status,
      statusLabel: STATUS_LABEL[o.status] ?? o.status,
      total: Number(o.total),
      subtotal: Number(o.subtotal),
      shipping_cost: Number(o.shipping_cost),
      discount: Number(o.discount),
      created_at: o.created_at,
      user: o.user,
      address: o.address,
      items: o.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        variant: {
          name: item.variant.name,
          product: { name: item.variant.product.name },
        },
      })),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("[DASHBOARD ORDERS GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
