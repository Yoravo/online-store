'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
interface Variant {
  id: string
  name: string
  price: number
  stock: number
  sku: string | null
}
interface Category {
  id: string
  name: string
}
export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [variants, setVariants] = useState<Variant[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, catRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch('/api/categories'),
        ])
        if (!productRes.ok) throw new Error('Produk tidak ditemukan')
        const { product } = await productRes.json()
        const { categories: cats } = await catRes.json()
        setName(product.name)
        setDescription(product.description || '')
        setCategoryId(product.category?.id || '')
        setIsActive(product.is_active)
        setVariants(
          product.variants.map((v: Variant) => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            stock: v.stock,
            sku: v.sku,
          }))
        )
        setCategories(cats)
      } catch (error) {
        setError('Gagal memuat data produk')
        
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])
  const handleVariantChange = (
    index: number,
    field: keyof Omit<Variant, 'id'>,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          categoryId,
          isActive,
          variants,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Gagal menyimpan')
      }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/products'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
        <Link
          href="/dashboard/products"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          Kembali
        </Link>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded">
          Produk berhasil disimpan! Mengalihkan...
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow border space-y-6"
      >
        {/* Info Produk */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Produk</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Produk Aktif
          </label>
        </div>
        {/* Variants */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-900">Variant Produk</h2>
          {variants.map((v, i) => (
            <div
              key={v.id}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Variant</label>
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => handleVariantChange(i, 'price', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stok</label>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SKU (opsional)</label>
                <input
                  type="text"
                  value={v.sku || ''}
                  onChange={(e) => handleVariantChange(i, 'sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}