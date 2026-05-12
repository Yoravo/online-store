import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/db";
import { signToken } from "@/src/lib/auth";
import { registerLimiter, getClientIp } from "@/src/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success, reset } = await registerLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { message: "Terlalu banyak percobaan registrasi. Coba lagi nanti." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        },
      );
    }

    const { name, email, password } = await req.json();

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter" },
        { status: 400 },
      );
    }

    // Cek format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 },
      );
    }

    // Cek email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Tidak dapat mendaftar dengan email ini" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user + cart sekaligus
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cart: { create: {} },
      },
    });

    // Generate token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie & return response
    const response = NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return response;
  } catch (error) {
    logError("[REGISTER ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
