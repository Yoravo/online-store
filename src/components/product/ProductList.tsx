'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/src/components/product/ProductCard'

interface Product {
  id: string
  name: string
  slug: string
  store: { name: string; slug: string }
  category: { name: string; slug: string }
  images: { url: string }[]
  variants: { price: number }[]
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const MAX_PAGE = 100;
const MAX_LIMIT = 50;

export default function ProductList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)

  const page = Math.min(Math.max(1, Number(searchParams.get('page') || '1')), MAX_PAGE)
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''
  const q = searchParams.get('q') || ''

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(Math.min(12, MAX_LIMIT)))
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    if (q) params.set('q', q)

    setLoading(true)
    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setPagination(data.pagination)
      })
      .finally(() => setLoading(false))
  }, [page, category, sort, q])

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', Math.min(p, MAX_PAGE).toString())
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Active search indicator */}
      {q && (
        <p className="text-sm text-gray-500">
          Hasil pencarian untuk <span className="font-medium text-gray-900">&quot;{q}&quot;</span>
        </p>
      )}

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Produk tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci atau kategori lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  )
}