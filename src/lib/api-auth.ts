import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "@/src/lib/auth";
import prisma from "@/src/lib/db";

export async function getAuthUser(
  req: NextRequest,
): Promise<JWTPayload | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function getAuthUserFresh(req: NextRequest) {
  const payload = await getAuthUser(req);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true },
  });

  return user;
}
