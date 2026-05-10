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

    const vouchers = await prisma.voucher.findMany({
      where: { store_id: store.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ vouchers });
  } catch (error) {
    console.error("[DASHBOARD VOUCHERS GET]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    const { code, type, value, minPurchase, quota, expiredAt } =
      await req.json();

    if (!code?.trim() || !type || !value || !quota || !expiredAt)
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 },
      );

    if (!["PERCENTAGE", "FIXED"].includes(type))
      return NextResponse.json(
        { message: "Tipe voucher tidak valid" },
        { status: 400 },
      );

    if (type === "PERCENTAGE" && value > 100)
      return NextResponse.json(
        { message: "Persentase maksimal 100%" },
        { status: 400 },
      );

    const exists = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (exists)
      return NextResponse.json(
        { message: "Kode voucher sudah digunakan" },
        { status: 409 },
      );

    const voucher = await prisma.voucher.create({
      data: {
        store_id: store.id,
        code: code.toUpperCase(),
        type,
        value,
        min_purchase: minPurchase || 0,
        quota,
        expired_at: new Date(expiredAt),
      },
    });

    return NextResponse.json(
      { message: "Voucher berhasil dibuat", voucher },
      { status: 201 },
    );
  } catch (error) {
    console.error("[DASHBOARD VOUCHERS POST]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
