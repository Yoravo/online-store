import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
      50,
    );

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { user_id: authUser.id },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          store: { select: { name: true, slug: true } },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { where: { is_primary: true }, take: 1 },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: { user_id: authUser.id } }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    logError("[ORDERS GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
