"use client";

import { useEffect, useReducer, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Package } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
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

type State = { orders: Order[]; loading: boolean };
type Action = { type: "SET_ORDERS"; orders: Order[] } | { type: "SET_LOADED" };

const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case "SET_ORDERS":
      return { orders: a.orders, loading: false };
    case "SET_LOADED":
      return { ...s, loading: false };
    default:
      return s;
  }
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Menunggu",
    color: "bg-gray-100 text-gray-500",
    dot: "bg-gray-300",
  },
  WAITING_PAYMENT: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
  },
  PAID: {
    label: "Dibayar",
    color: "bg-blue-50 text-blue-600",
    dot: "bg-blue-400",
  },
  PROCESSING: {
    label: "Diproses",
    color: "bg-purple-50 text-purple-600",
    dot: "bg-purple-400",
  },
  SHIPPED: {
    label: "Dikirim",
    color: "bg-indigo-50 text-indigo-600",
    dot: "bg-indigo-400",
  },
  DELIVERED: {
    label: "Selesai",
    color: "bg-green-50 text-green-600",
    dot: "bg-green-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-50 text-red-500",
    dot: "bg-red-400",
  },
  REFUNDED: {
    label: "Direfund",
    color: "bg-orange-50 text-orange-500",
    dot: "bg-orange-400",
  },
};

const TABS = [
  { label: "Semua", value: "" },
  { label: "Bayar", value: "WAITING_PAYMENT" },
  { label: "Diproses", value: "PROCESSING" },
  { label: "Dikirim", value: "SHIPPED" },
  { label: "Selesai", value: "DELIVERED" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function OrdersPage() {
  const [state, dispatch] = useReducer(reducer, { orders: [], loading: true });
  const [activeTab, setActiveTab] = useState("");
  const { orders, loading } = state;

  useEffect(() => {
    let cancelled = false;
    const url = activeTab ? `/api/orders?status=${activeTab}` : "/api/orders";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled)
          dispatch({ type: "SET_ORDERS", orders: d.orders || [] });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "SET_LOADED" });
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pesanan Saya</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Riwayat dan status pembelian
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              dispatch({ type: "SET_ORDERS", orders: [] });
            }}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-5 bg-gray-100 rounded-lg w-20" />
              </div>
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Package size={28} className="text-gray-200" />
          </div>
          <p className="text-base font-semibold text-gray-900 mb-1">
            Belum ada pesanan
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {activeTab
              ? "Tidak ada pesanan dengan status ini"
              : "Yuk mulai belanja!"}
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const firstItem = order.items[0];
            const firstImage = firstItem?.variant.product.images[0]?.url;
            const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden">
                  {/* Store + Status */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-sm font-semibold text-gray-700">
                        {order.store.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      <ChevronRight size={14} className="text-gray-300" />
                    </div>
                  </div>

                  {/* Item Preview */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {firstImage ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                        <Image
                          width={56}
                          height={56}
                          src={firstImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <ShoppingBag size={20} className="text-gray-200" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {firstItem?.variant.product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {firstItem?.variant.name} × {firstItem?.quantity}
                        {order.items.length > 1 &&
                          ` · +${order.items.length - 1} produk lain`}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 bg-gray-50/40">
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {totalItems} item
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {fmt(Number(order.total))}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
