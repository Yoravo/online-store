'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/src/components/product/ProductCard'
import { Search } from 'lucide-react'

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

export default function ProductList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const page = searchParams.get('page') || '1'
  const category = searchParams.get('category') || ''
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    const params = new URLSearchParams()
    if (page) params.set('page', page)
    if (category) params.set('category', category)
    if (searchQuery) params.set('search', searchQuery)

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setPagination(data.pagination)
      })
      .finally(() => setLoading(false))
  }, [page, category, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', p.toString())
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </form>

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