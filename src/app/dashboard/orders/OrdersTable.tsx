// src/app/dashboard/orders/OrdersTable.tsx
'use client'

import { useState } from 'react'

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  WAITING_PAYMENT: 'bg-orange-100 text-orange-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  variant: {
    name: string
    product: { name: string }
  }
}

interface Order {
  id: string
  status: string
  statusLabel: string
  total: number
  subtotal: number
  shipping_cost: number
  discount: number
  created_at: string
  user: { name: string; email: string }
  address: { recipient: string; city: string; province: string }
  items: OrderItem[]
}

interface Props {
  orders: Order[]
}

export default function OrdersTable({ orders }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [localOrders, setLocalOrders] = useState<Order[]>(orders)

  const NEXT_STATUS: Record<string, { value: string; label: string }> = {
    PAID: { value: 'PROCESSING', label: 'Proses Pesanan' },
    PROCESSING: { value: 'SHIPPED', label: 'Tandai Dikirim' },
    SHIPPED: { value: 'DELIVERED', label: 'Tandai Selesai' },
  }

  const STATUS_LABEL: Record<string, string> = {
    PENDING: 'Menunggu',
    WAITING_PAYMENT: 'Menunggu Pembayaran',
    PAID: 'Dibayar',
    PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim',
    DELIVERED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REFUNDED: 'Dikembalikan',
  }

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error()

      setLocalOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: nextStatus, statusLabel: STATUS_LABEL[nextStatus] }
            : o
        )
      )
    } catch {
      alert('Gagal memperbarui status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (localOrders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border shadow">
        <p className="text-gray-500">Belum ada pesanan masuk.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID Pesanan', 'Pembeli', 'Alamat', 'Total', 'Status', 'Aksi'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {localOrders.map((order) => (
              <>
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{order.user.name}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.address.city}, {order.address.province}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    IDR {order.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                    {NEXT_STATUS[order.status] ? (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() =>
                          handleUpdateStatus(order.id, NEXT_STATUS[order.status].value)
                        }
                        className="px-3 py-1 bg-black text-white text-xs rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {updatingId === order.id
                          ? 'Loading...'
                          : NEXT_STATUS[order.status].label}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>

                {/* Expanded Detail */}
                {expandedId === order.id && (
                  <tr key={`${order.id}-detail`} className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Detail Pesanan
                        </p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm text-gray-700"
                            >
                              <span>
                                {item.variant.product.name}{' '}
                                <span className="text-gray-400">
                                  ({item.variant.name})
                                </span>{' '}
                                × {item.quantity}
                              </span>
                              <span>
                                IDR {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-2 text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>IDR {order.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ongkos kirim</span>
                            <span>IDR {order.shipping_cost.toLocaleString('id-ID')}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Diskon</span>
                              <span>- IDR {order.discount.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-gray-900 border-t pt-1">
                            <span>Total</span>
                            <span>IDR {order.total.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Penerima: {order.address.recipient} ·{' '}
                          {order.address.city}, {order.address.province}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
