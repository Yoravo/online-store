import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "@/src/lib/auth";

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  return await verifyToken(token)
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ message }, { status: 401 })
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ message }, { status: 403 })
}