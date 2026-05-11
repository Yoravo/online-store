import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { user_id: authUser.id },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { user_id: authUser.id, is_read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    logError("[NOTIFICATIONS GET]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await prisma.notification.updateMany({
      where: { user_id: authUser.id, is_read: false },
      data: { is_read: true },
    });

    return NextResponse.json({ message: "Semua notifikasi ditandai dibaca" });
  } catch (error) {
    logError("[NOTIFICATIONS PATCH]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
