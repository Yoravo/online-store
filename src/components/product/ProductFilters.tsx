'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const activeCategory = searchParams.get('category') || ''

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories))
  }, [])

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Kategori</h3>
        <div className="space-y-1">
          <button
            onClick={() => setFilter('category', '')}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !activeCategory
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter('category', cat.slug)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}