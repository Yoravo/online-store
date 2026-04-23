import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// PATCH - request for accepting store request
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!["approve", "reject", "suspend", "reactivate"].includes(action)) {
      return NextResponse.json(
        { message: "Action tidak valid" },
        { status: 400 },
      );
    }

    const store = await prisma.store.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!store) {
      return NextResponse.json(
        { message: "Toko tidak ditemukan" },
        { status: 404 },
      );
    }

    const newStatus =
      action === "approve" || action === "reactivate"
        ? "ACTIVE"
        : action === "reject"
          ? "REJECTED"
          : "SUSPENDED";

    await prisma.store.update({
      where: { id },
      data: {
        status: newStatus,
        is_active: action === "approve" || action === "reactivate",
      },
    });

    // if approved, update user role to SELLER
    if (action === "approve" || action === "reactivate") {
      await prisma.user.update({
        where: { id: store.user_id },
        data: { role: "SELLER" },
      });

      // send notification
      await prisma.notification.create({
        data: {
          user_id: store.user_id,
          title: "Toko kamu disetujui!",
          message: `Selamat! Toko "${store.name}" kamu telah disetujui. Kamu sekarang bisa mulai berjualan.`,
        },
      });
    }

    if (action === "reject") {
      await prisma.notification.create({
        data: {
          user_id: store.user_id,
          title: "Pengajuan toko ditolak",
          message: `Maaf, pengajuan toko "${store.name}" kamu belum bisa disetujui. Silakan hubungi admin untuk informasi lebih lanjut.`,
        },
      });
    }

    return NextResponse.json({
      message:
        action === "approve"
          ? "Toko disetujui dan seller diaktifkan"
          : action === "reject"
            ? "Toko ditolak"
            : "Toko disuspend",
    });
  } catch (error) {
    console.error("[ADMIN STORE PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
