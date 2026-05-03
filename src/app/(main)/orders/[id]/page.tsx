"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Store,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface OrderDetail {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  created_at: string;
  midtrans_url: string | null;
  store: { id: string; name: string; slug: string };
  address: {
    label: string;
    recipient: string;
    phone: string;
    full_address: string;
    district: string;
    city: string;
    province: string;
    postal_code: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    variant: {
      name: string;
      product: {
        id: string;
        name: string;
        slug: string;
        images: { url: string }[];
      };
    };
  }[];
  shipment: {
    courier: string;
    service: string;
    tracking_number: string | null;
    status: string;
  } | null;
}

const statusSteps = [
  { key: "WAITING_PAYMENT", label: "Menunggu Pembayaran", icon: Clock },
  { key: "PAID", label: "Dibayar", icon: CheckCircle },
  { key: "PROCESSING", label: "Diproses", icon: Package },
  { key: "SHIPPED", label: "Dikirim", icon: Truck },
  { key: "DELIVERED", label: "Selesai", icon: CheckCircle },
];

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
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/4" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <XCircle size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="text-gray-400">Order tidak ditemukan</p>
        <Link
          href="/orders"
          className="text-sm text-black underline mt-2 inline-block"
        >
          Kembali ke pesanan
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusConfig[order.status]?.color || "bg-gray-100 text-gray-500"}`}
        >
          {statusConfig[order.status]?.label || order.status}
        </span>
      </div>

      {/* Status Steps */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 mx-8" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-black mx-8 transition-all"
              style={{
                width:
                  currentStepIndex >= 0
                    ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`
                    : "0%",
              }}
            />

            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center gap-2 relative z-10"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <p
                    className={`text-[10px] text-center max-w-15 leading-tight ${
                      isCompleted
                        ? "text-gray-900 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bayar sekarang kalau masih WAITING_PAYMENT */}
      {order.status === "WAITING_PAYMENT" && order.midtrans_url && (
        <a
          href={order.midtrans_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-black text-white rounded-2xl text-sm font-semibold text-center hover:bg-gray-800 transition-colors"
        >
          Bayar Sekarang
        </a>
      )}

      {/* Info Toko */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <Link
          href={`/stores/${order.store.slug}`}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-black transition-colors"
        >
          <Store size={15} className="text-gray-400" />
          {order.store.name}
        </Link>

        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                {item.variant.product.images[0] ? (
                  <img
                    src={item.variant.product.images[0].url}
                    alt={item.variant.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={16} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.variant.product.slug}`}>
                  <p className="text-sm font-medium text-gray-900 hover:underline line-clamp-1">
                    {item.variant.product.name}
                  </p>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.variant.name} × {item.quantity}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatPrice(Number(item.price) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alamat */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <MapPin size={14} /> Alamat Pengiriman
        </h2>
        <p className="text-sm font-medium text-gray-900">
          {order.address.recipient}
        </p>
        <p className="text-xs text-gray-500">{order.address.phone}</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          {order.address.full_address}, {order.address.district},{" "}
          {order.address.city}, {order.address.province}{" "}
          {order.address.postal_code}
        </p>
      </div>

      {/* Pengiriman */}
      {order.shipment && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Truck size={14} /> Info Pengiriman
          </h2>
          <p className="text-sm text-gray-700">
            {order.shipment.courier} - {order.shipment.service}
          </p>
          {order.shipment.tracking_number && (
            <p className="text-xs text-gray-500">
              No. Resi:{" "}
              <span className="font-mono font-medium">
                {order.shipment.tracking_number}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Ringkasan Pembayaran */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Ringkasan Pembayaran
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Ongkos Kirim</span>
            <span>{formatPrice(Number(order.shipping_cost))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Diskon</span>
              <span>-{formatPrice(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
