import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { store_id: store.id, is_active: true } }),
      prisma.order.count({ where: { store_id: store.id } }),
      prisma.order.count({ where: { store_id: store.id, status: "PENDING" } }),
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
        take: 5,
        include: {
          items: {
            include: {
              variant: { include: { product: { select: { name: true } } } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      store,
      stats: {
        totalProducts,
        totalOrders,
        pendingOrders,
        revenue: revenueResult._sum.total ?? 0,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("[DASHBOARD GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
