import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// GET — cek apakah produk sudah di-wishlist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return NextResponse.json({ wishlisted: false });

    const { productId } = await params;

    const existing = await prisma.wishlist.findUnique({
      where: {
        user_id_product_id: { user_id: authUser.id, product_id: productId },
      },
    });

    return NextResponse.json({ wishlisted: !!existing });
  } catch (error) {
    console.error("[WISHLIST CHECK ERROR]", error);
    return NextResponse.json({ wishlisted: false });
  }
}
