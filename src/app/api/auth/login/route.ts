import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/db";
import { signToken } from "@/src/lib/auth";

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const attempts = loginAttempts.get(ip);

    if (
      attempts &&
      now - attempts.lastAttempt < WINDOW_MS &&
      attempts.count >= MAX_ATTEMPTS
    ) {
      return NextResponse.json(
        { message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
        { status: 429 },
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const current = loginAttempts.get(ip);
      loginAttempts.set(ip, {
        count:
          (current && now - current.lastAttempt < WINDOW_MS
            ? current.count
            : 0) + 1,
        lastAttempt: now,
      });
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 },
      );
    }

    loginAttempts.delete(ip);

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    logError("[LOGIN ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
