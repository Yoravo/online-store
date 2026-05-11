import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { role } = await req.json();

    if (!["BUYER", "SELLER", "ADMIN"].includes(role))
      return NextResponse.json(
        { message: "Role tidak valid" },
        { status: 400 },
      );

    if (id === authUser.id)
      return NextResponse.json(
        { message: "Tidak bisa mengubah role sendiri" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user)
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({
      message: "Role berhasil diubah",
      user: updated,
    });
  } catch (error) {
    logError("[ADMIN USER PATCH]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
