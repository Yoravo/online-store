import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const expected = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (signature_key !== expected) {
      console.warn(`[WEBHOOK] Invalid signature for order: ${order_id}`);
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 },
      );
    }

    if (!order_id || !transaction_status) {
      return NextResponse.json(
        { message: "Data tidak valid" },
        { status: 400 },
      );
    }

    let orderStatus: string | null = null;

    if (transaction_status === "capture") {
      orderStatus = fraud_status === "accept" ? "PAID" : null;
    } else if (transaction_status === "settlement") {
      orderStatus = "PAID";
    } else if (transaction_status === "pending") {
      orderStatus = "WAITING_PAYMENT";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      orderStatus = "CANCELLED";
    }

    if (!orderStatus) {
      return NextResponse.json({ message: "Status tidak diproses" });
    }

    const orders = await prisma.order.findMany({
      where: { midtrans_order_id: order_id },
      include: { items: { include: { variant: true } } },
    });

    if (!orders.length) {
      logError(`[WEBHOOK] Order tidak ditemukan: ${order_id}`);
      return NextResponse.json(
        { message: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    for (const order of orders) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus as "PAID" | "WAITING_PAYMENT" | "CANCELLED",
        },
      });

      if (orderStatus === "PAID") {
        await prisma.notification.create({
          data: {
            user_id: order.user_id,
            title: "Pembayaran berhasil!",
            message: `Pesanan #${order.id.slice(0, 8).toUpperCase()} berhasil dibayar dan sedang diproses seller.`,
          },
        });

        const store = await prisma.store.findUnique({
          where: { id: order.store_id },
          select: { user_id: true },
        });

        if (store) {
          await prisma.notification.create({
            data: {
              user_id: store.user_id,
              title: "Pesanan baru masuk!",
              message: `Ada pesanan baru #${order.id.slice(0, 8).toUpperCase()} yang perlu kamu proses.`,
            },
          });
        }
      }

      if (orderStatus === "CANCELLED") {
        for (const item of order.items) {
          await prisma.productVariant.update({
            where: { id: item.variant_id },
            data: { stock: { increment: item.quantity } },
          });
        }

        await prisma.notification.create({
          data: {
            user_id: order.user_id,
            title: "Pesanan dibatalkan",
            message: `Pesanan #${order.id.slice(0, 8).toUpperCase()} dibatalkan karena pembayaran tidak berhasil.`,
          },
        });
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    logError("[WEBHOOK ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
