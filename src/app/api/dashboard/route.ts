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
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        status: true,
        is_active: true,
      },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    // Last 7 days range
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      revenueResult,
      recentOrders,
      weeklyOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { store_id: store.id, is_active: true } }),
      prisma.order.count({ where: { store_id: store.id } }),
      prisma.order.count({
        where: {
          store_id: store.id,
          status: { in: ["PENDING", "WAITING_PAYMENT"] },
        },
      }),
      prisma.order.count({
        where: { store_id: store.id, status: { in: ["PAID", "PROCESSING"] } },
      }),
      prisma.order.aggregate({
        where: {
          store_id: store.id,
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { store_id: store.id },
        orderBy: { created_at: "desc" },
        take: 8,
        include: {
          user: { select: { name: true } },
          items: {
            include: {
              variant: { include: { product: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.order.findMany({
        where: {
          store_id: store.id,
          created_at: { gte: sevenDaysAgo },
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        },
        select: { created_at: true, total: true },
      }),
    ]);

    // Group weekly orders by day
    const dailyRevenue: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("id-ID", { weekday: "short" });
      dailyRevenue[key] = 0;
    }
    weeklyOrders.forEach((o) => {
      const key = new Date(o.created_at).toLocaleDateString("id-ID", {
        weekday: "short",
      });
      if (key in dailyRevenue) dailyRevenue[key] += Number(o.total);
    });

    return NextResponse.json({
      store,
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        revenue: revenueResult._sum.total ?? 0,
      },
      recentOrders,
      dailyRevenue: Object.entries(dailyRevenue).map(([day, revenue]) => ({
        day,
        revenue,
      })),
    });
  } catch (error) {
    logError("[DASHBOARD GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
