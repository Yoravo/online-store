import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/api-auth";
import prisma from "@/src/lib/db";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);

  if (!authUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  });
  return NextResponse.json({ user });
}
