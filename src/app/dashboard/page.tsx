"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: { quantity: number; variant: { product: { name: string } } }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setStoreName(data.store?.name || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600",
    WAITING_PAYMENT: "bg-blue-50 text-blue-600",
    PAID: "bg-green-50 text-green-600",
    PROCESSING: "bg-purple-50 text-purple-600",
    SHIPPED: "bg-indigo-50 text-indigo-600",
    DELIVERED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-500",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-4" />
              <div className="h-6 bg-gray-100 rounded w-1/2 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{storeName}</h1>
        <p className="text-sm text-gray-400 mt-1">
          Selamat datang di dashboard seller kamu
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Produk Aktif",
            value: stats?.totalProducts ?? 0,
            icon: Package,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Total Order",
            value: stats?.totalOrders ?? 0,
            icon: ShoppingBag,
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "Order Pending",
            value: stats?.pendingOrders ?? 0,
            icon: Clock,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Total Revenue",
            value: formatPrice(Number(stats?.revenue ?? 0)),
            icon: TrendingUp,
            color: "bg-green-50 text-green-600",
            isString: true,
          },
        ].map(({ label, value, icon: Icon, color, isString }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}
            >
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isString ? value : value.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Order Terbaru</h2>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors"
          >
            Lihat semua <ArrowRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Belum ada pesanan masuk</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} item •{" "}
                    {new Date(order.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor[order.status] || "bg-gray-100 text-gray-500"}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatPrice(Number(order.total))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
