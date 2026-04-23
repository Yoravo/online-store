import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";
import { StoreStatus } from "@/src/generated.prisma/enums";

// GET - request for getting all stores
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as StoreStatus | null

    const stores = await prisma.store.findMany({
      where: status ? { status } : {},
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error('[ADMIN STORES GET ERROR]', error)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
