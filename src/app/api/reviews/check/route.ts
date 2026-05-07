import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ reviewed: false });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const orderId = searchParams.get("orderId");

    if (!productId || !orderId) return NextResponse.json({ reviewed: false });

    const existing = await prisma.review.findUnique({
      where: {
        user_id_product_id_order_id: {
          user_id: authUser.id,
          product_id: productId,
          order_id: orderId,
        },
      },
    });

    return NextResponse.json({ reviewed: !!existing });
  } catch {
    return NextResponse.json({ reviewed: false });
  }
}
