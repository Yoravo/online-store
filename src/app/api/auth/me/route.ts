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

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name ? { name } : {}),
        ...(avatar ? { avatar } : {}),
      },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[ME PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
