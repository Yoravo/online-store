import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/db";
import { signToken } from "@/src/lib/auth";

const registerAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();
const MAX_REGISTER = 3;
const REGISTER_WINDOW = 60 * 60 * 1000; // 1 jam

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const attempts = registerAttempts.get(ip);
    const { name, email, password } = await req.json();

    if (
      attempts &&
      now - attempts.lastAttempt < REGISTER_WINDOW &&
      attempts.count >= MAX_REGISTER
    ) {
      return NextResponse.json(
        { message: "Terlalu banyak percobaan registrasi. Coba lagi nanti." },
        { status: 429 },
      );
    }

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

    // cek format email sederhana
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

    const current = registerAttempts.get(ip);
    registerAttempts.set(ip, {
      count:
        (current && now - current.lastAttempt < REGISTER_WINDOW
          ? current.count
          : 0) + 1,
      lastAttempt: now,
    });

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
