import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/src/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        is_active: true,
      },
      include: {
        category: { select: { name: true, slug: true } },
        store: { select: { id: true, name: true, slug: true, logo: true } },
        images: true,
        variants: { orderBy: { price: 'asc' } },
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hitung rata-rata rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length
        : 0

    return NextResponse.json({ product, avgRating })
  } catch (error) {
    console.error('[PRODUCT DETAIL ERROR]', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}