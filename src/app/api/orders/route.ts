import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/db'
import { getAuthUser } from '@/src/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    if (!authUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { user_id: authUser.id },
      orderBy: { created_at: 'desc' },
      include: {
        store: { select: { name: true, slug: true } },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { is_primary: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[ORDERS GET ERROR]', error)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}