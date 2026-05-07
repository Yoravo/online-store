import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

const VALID_TRANSITIONS: Record<string, string> = {
  PAID: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const { status } = await req.json();

    const order = await prisma.order.findFirst({
      where: { id, store_id: store.id },
    });
    if (!order)
      return NextResponse.json(
        { message: "Order tidak ditemukan" },
        { status: 404 },
      );

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || allowed !== status) {
      return NextResponse.json(
        {
          message: `Tidak bisa update status dari ${order.status} ke ${status}`,
        },
        { status: 400 },
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("[DASHBOARD ORDER PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
