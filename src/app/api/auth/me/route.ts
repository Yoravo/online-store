import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/api-auth";
import prisma from "@/src/lib/db";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ user: null }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, avatar } = await req.json();

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length < 1 || name.length > 100)
    ) {
      return NextResponse.json(
        { message: "Nama harus 1-100 karakter" },
        { status: 400 },
      );
    }

    if (avatar !== undefined && avatar !== null) {
      try {
        const url = new URL(avatar);
        if (!["https:"].includes(url.protocol)) {
          return NextResponse.json(
            { message: "Avatar harus URL HTTPS" },
            { status: 400 },
          );
        }
      } catch {
        return NextResponse.json(
          { message: "Avatar bukan URL valid" },
          { status: 400 },
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    logError("[ME PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
