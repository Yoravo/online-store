import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";
import { signToken } from "@/src/lib/auth";
import { logError } from "@/src/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { code } = await req.json();
    if (!code || code.length !== 6)
      return NextResponse.json({ message: "Kode tidak valid" }, { status: 400 });

    const verification = await prisma.emailVerification.findFirst({
      where: {
        user_id: authUser.id,
        code,
        expires_at: { gt: new Date() },
      },
    });

    if (!verification)
      return NextResponse.json(
        { message: "Kode salah atau sudah expired" },
        { status: 400 },
      );

    await prisma.$transaction([
      prisma.user.update({
        where: { id: authUser.id },
        data: { email_verified: true },
      }),
      prisma.emailVerification.deleteMany({
        where: { user_id: authUser.id },
      }),
    ]);

    // Re-issue token with email_verified: true
    const newToken = await signToken({
      id: authUser.id,
      email: authUser.email,
      role: authUser.role as string,
      email_verified: true,
    });

    const response = NextResponse.json({ message: "Email berhasil diverifikasi" });
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    logError("[VERIFY ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
