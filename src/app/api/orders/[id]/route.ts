// src/app/api/orders/[id]/route.ts (buat file baru)
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/db'
import { getAuthUser, unauthorizedResponse, forbiddenResponse } from '@/src/lib/api-auth'

const SELLER_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PAID: ['PROCESSING'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req)
    if (!authUser) return unauthorizedResponse()
    if (authUser.role !== 'SELLER') return forbiddenResponse()

    const { id } = await params
    const { status } = await req.json()

    const order = await prisma.order.findFirst({
      where: { id, store: { user_id: authUser.id } },
    })

    if (!order) {
      return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    const allowedNext = SELLER_ALLOWED_TRANSITIONS[order.status]
    if (!allowedNext || !allowedNext.includes(status)) {
      return NextResponse.json(
        { message: `Tidak bisa mengubah status dari ${order.status} ke ${status}` },
        { status: 400 }
      )
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('[ORDER PATCH ERROR]', error)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
