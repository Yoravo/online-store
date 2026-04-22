'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Store, Star, ChevronLeft } from 'lucide-react'

interface Variant {
  id: string
  name: string
  price: number
  stock: number
}

interface Review {
  id: string
  rating: number
  comment: string | null
  user: { name: string; avatar: string | null }
  created_at: string
}

interface Product {
  id: string
  name: string
  description: string | null
  images: { id: string; url: string; is_primary: boolean }[]
  variants: Variant[]
  store: { id: string; name: string; slug: string; logo: string | null }
  category: { name: string; slug: string }
  reviews: Review[]
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product)
        setAvgRating(data.avgRating)
        setSelectedVariant(data.product?.variants[0] || null)
        const primary = data.product?.images.find((i: { is_primary: boolean }) => i.is_primary)
        setSelectedImage(primary?.url || data.product?.images[0]?.url || null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Produk tidak ditemukan</p>
        <Link href="/products" className="text-sm text-black underline mt-2 inline-block">
          Kembali ke produk
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali ke produk
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 relative">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                No Image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map(img => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === img.url
                      ? 'border-black'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">{product.category.name}</p>
            <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          </div>

          {/* Rating */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} ({product.reviews.length} ulasan)
              </span>
            </div>
          )}

          {/* Price */}
          {selectedVariant && (
            <p className="text-3xl font-bold text-gray-900">
              {formatPrice(Number(selectedVariant.price))}
            </p>
          )}

          {/* Variants */}
          {product.variants.length > 1 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Varian</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedVariant?.id === v.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="text-sm font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 1, q + 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                +
              </button>
              {selectedVariant && (
                <span className="text-xs text-gray-400">
                  Stok: {selectedVariant.stock}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 py-3 rounded-xl border border-black text-black text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Keranjang
            </button>
            <button
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Beli Sekarang
            </button>
          </div>

          {/* Store */}
          <Link
            href={`/stores/${product.store.slug}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {product.store.logo ? (
                <Image
                  src={product.store.logo}
                  alt={product.store.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <Store size={18} className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{product.store.name}</p>
              <p className="text-xs text-gray-400">Lihat toko</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi Produk</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Reviews */}
      <div className="border-t border-gray-100 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Ulasan ({product.reviews.length})
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada ulasan untuk produk ini.</p>
        ) : (
          <div className="space-y-6">
            {product.reviews.map(review => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 pl-11">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}