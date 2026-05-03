"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  midtrans_order_id: string | null;
  store: { name: string; slug: string };
  items: {
    id: string;
    quantity: number;
    price: number;
    variant: {
      name: string;
      product: { name: string; images: { url: string }[] };
    };
  }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu", color: "bg-gray-100 text-gray-500" },
  WAITING_PAYMENT: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-50 text-amber-600",
  },
  PAID: { label: "Dibayar", color: "bg-blue-50 text-blue-600" },
  PROCESSING: { label: "Diproses", color: "bg-purple-50 text-purple-600" },
  SHIPPED: { label: "Dikirim", color: "bg-indigo-50 text-indigo-600" },
  DELIVERED: { label: "Selesai", color: "bg-green-50 text-green-600" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-50 text-red-500" },
  REFUNDED: { label: "Direfund", color: "bg-orange-50 text-orange-500" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3"
          >
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-16 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Belum ada pesanan
        </h2>
        <p className="text-sm text-gray-400 mb-6">Yuk mulai belanja!</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Pesanan Saya</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status] || {
            label: order.status,
            color: "bg-gray-100 text-gray-500",
          };
          const firstImage = order.items[0]?.variant.product.images[0]?.url;

          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {order.store.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-3">
                  {firstImage && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <Image
                        width={56}
                        height={56}
                        src={firstImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.items[0]?.variant.product.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.items[0]?.variant.name} ×{" "}
                      {order.items[0]?.quantity}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} produk lain`}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(Number(order.total))}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
