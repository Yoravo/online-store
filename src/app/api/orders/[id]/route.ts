import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, user_id: authUser.id },
      include: {
        store: { select: { id: true, name: true, slug: true } },
        address: true,
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
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[ORDER DETAIL ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
