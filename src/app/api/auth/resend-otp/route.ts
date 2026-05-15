import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";
import { generateOTP, sendVerificationEmail } from "@/src/lib/email";
import { logError } from "@/src/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { email: true, email_verified: true },
    });

    if (!user)
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    if (user.email_verified)
      return NextResponse.json({ message: "Email sudah terverifikasi" });

    // Rate limit: max 1 OTP per 60 detik
    const recent = await prisma.emailVerification.findFirst({
      where: {
        user_id: authUser.id,
        created_at: { gt: new Date(Date.now() - 60_000) },
      },
    });
    if (recent)
      return NextResponse.json(
        { message: "Tunggu 60 detik sebelum kirim ulang" },
        { status: 429 },
      );

    // Hapus OTP lama, buat baru
    await prisma.emailVerification.deleteMany({ where: { user_id: authUser.id } });

    const code = generateOTP();
    await prisma.emailVerification.create({
      data: {
        user_id: authUser.id,
        code,
        expires_at: new Date(Date.now() + 10 * 60_000), // 10 menit
      },
    });

    await sendVerificationEmail(user.email, code);

    return NextResponse.json({ message: "Kode verifikasi telah dikirim" });
  } catch (error) {
    logError("[RESEND OTP ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
