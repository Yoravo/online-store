import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });
    if (!store)
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );

    const voucher = await prisma.voucher.findFirst({
      where: { id, store_id: store.id },
    });
    if (!voucher)
      return NextResponse.json(
        { message: "Voucher tidak ditemukan" },
        { status: 404 },
      );

    await prisma.voucher.delete({ where: { id } });

    return NextResponse.json({ message: "Voucher berhasil dihapus" });
  } catch (error) {
    logError("[DASHBOARD VOUCHER DELETE]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
