import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { coreApi } from "@/src/lib/midtrans";
import { logError } from "@/src/lib/logger";

// Dipanggil via cron (Vercel Cron / external) atau manual
// Header Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Cari order WAITING_PAYMENT yang sudah > 30 menit
    const staleOrders = await prisma.order.findMany({
      where: {
        status: "WAITING_PAYMENT",
        midtrans_order_id: { not: null },
        created_at: { lt: new Date(Date.now() - 30 * 60_000) },
      },
      select: { id: true, midtrans_order_id: true, user_id: true },
      take: 50,
    });

    // Group by midtrans_order_id (multiple orders share same midtrans tx)
    const grouped = new Map<string, typeof staleOrders>();
    for (const order of staleOrders) {
      const key = order.midtrans_order_id!;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(order);
    }

    let reconciled = 0;

    for (const [midtransOrderId, orders] of grouped) {
      try {
        const status = await (coreApi as unknown as { transaction: { status: (id: string) => Promise<{ transaction_status: string }> } }).transaction.status(midtransOrderId);
        let newStatus: string | null = null;

        if (status.transaction_status === "settlement" || status.transaction_status === "capture") {
          newStatus = "PAID";
        } else if (["cancel", "deny", "expire"].includes(status.transaction_status)) {
          newStatus = "CANCELLED";
        }
        // pending → skip, masih menunggu

        if (newStatus) {
          for (const order of orders) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: newStatus as "PAID" | "CANCELLED" },
            });

            if (newStatus === "CANCELLED") {
              const items = await prisma.orderItem.findMany({
                where: { order_id: order.id },
              });
              for (const item of items) {
                await prisma.productVariant.update({
                  where: { id: item.variant_id },
                  data: { stock: { increment: item.quantity } },
                });
              }
            }
          }
          reconciled++;
        }
      } catch (err) {
        logError(`[RECONCILE] Failed for ${midtransOrderId}`, err);
      }
    }

    return NextResponse.json({
      message: `Reconciled ${reconciled} transactions`,
      checked: grouped.size,
    });
  } catch (error) {
    logError("[RECONCILE ERROR]", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
