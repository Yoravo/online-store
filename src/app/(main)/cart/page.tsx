'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, ChevronRight, Minus, Plus } from 'lucide-react'

interface CartItem {
  id: string
  quantity: number
  variant: {
    id: string
    name: string
    price: number
    stock: number
    product: {
      id: string
      name: string
      slug: string
      images: { url: string }[]
      store: { id: string; name: string; slug: string }
    }
  }
}

interface CartByStore {
  store: { id: string; name: string; slug: string }
  items: CartItem[]
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchCart = () => {
  fetch('/api/cart')
    .then(res => res.json())
    .then(data => {
      setItems(data.cart?.items || [])
      window.dispatchEvent(new Event('cart:updated'))
    })
    .finally(() => setLoading(false))
}

  useEffect(() => { fetchCart() }, [])

  const updateQty = async (itemId: string, quantity: number) => {
    setUpdatingId(itemId)
    await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    })
    fetchCart()
    setUpdatingId(null)
  }

  const removeItem = async (itemId: string) => {
    setUpdatingId(itemId)
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    fetchCart()
    setUpdatingId(null)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)

  // Kelompokkan per toko
  const cartByStore: CartByStore[] = items.reduce((acc, item) => {
    const store = item.variant.product.store
    const existing = acc.find(g => g.store.id === store.id)
    if (existing) {
      existing.items.push(item)
    } else {
      acc.push({ store, items: [item] })
    }
    return acc
  }, [] as CartByStore[])

  const total = items.reduce(
    (acc, item) => acc + Number(item.variant.price) * item.quantity,
    0
  )

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Keranjang kosong</h2>
        <p className="text-sm text-gray-400 mb-6">Yuk mulai belanja dan tambahkan produk ke keranjang</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Keranjang</h1>
        <p className="text-sm text-gray-400 mt-1">{items.length} item</p>
      </div>

      <div className="space-y-4">
        {cartByStore.map(({ store, items: storeItems }) => (
          <div key={store.id} className="border border-gray-100 rounded-2xl overflow-hidden">
            {/* Store Header */}
            <Link
              href={`/stores/${store.slug}`}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100"
            >
              <ShoppingBag size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{store.name}</span>
              <ChevronRight size={14} className="text-gray-400 ml-auto" />
            </Link>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {storeItems.map(item => {
                const image = item.variant.product.images[0]?.url
                const isUpdating = updatingId === item.id

                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 transition-opacity ${isUpdating ? 'opacity-50' : ''}`}
                  >
                    {/* Image */}
                    <Link href={`/products/${item.variant.product.slug}`}>
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                        {image ? (
                          <Image src={image} alt={item.variant.product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.variant.product.slug}`}>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:underline">
                          {item.variant.product.name}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Varian: {item.variant.name}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatPrice(Number(item.variant.price))}
                      </p>

                      {/* Qty & Delete */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock || isUpdating}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={isUpdating}
                          className="text-black-300 hover:text-red-400 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border border-gray-100 rounded-2xl p-5 space-y-4 sticky bottom-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Subtotal ({items.length} item)</span>
          <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full py-3 bg-black text-white rounded-xl text-sm font-medium text-center hover:bg-gray-800 transition-colors"
        >
          Lanjut ke Checkout
        </Link>
      </div>
    </div>
  )
}