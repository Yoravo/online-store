import { NextResponse } from 'next/server'
import prisma from '@/src/lib/db'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parent_id: null },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('[CATEGORIES GET ERROR]', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}