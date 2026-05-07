"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  MapPin,
  Store,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  X,
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

interface ReviewModal {
  productId: string;
  productName: string;
  orderId: string;
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

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());
  const [reviewModal, setReviewModal] = useState<ReviewModal | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then(async (data) => {
        setOrder(data.order);
        // Kalau DELIVERED, cek review status tiap item
        if (data.order?.status === "DELIVERED") {
          const checks = await Promise.all(
            data.order.items.map((item: OrderDetail["items"][0]) =>
              fetch(
                `/api/reviews/check?productId=${item.variant.product.id}&orderId=${data.order.id}`,
              )
                .then((r) => r.json())
                .then((d) => (d.reviewed ? item.variant.product.id : null)),
            ),
          );
          setReviewedItems(new Set(checks.filter(Boolean)));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const openReview = (productId: string, productName: string) => {
    setReviewModal({ productId, productName, orderId: order!.id });
    setRating(5);
    setHoverRating(0);
    setComment("");
    setReviewSuccess(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: reviewModal.productId,
          orderId: reviewModal.orderId,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setReviewSuccess(true);
        setReviewedItems((prev) => new Set([...prev, reviewModal.productId]));
        setTimeout(() => setReviewModal(null), 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-cream-dark rounded w-1/4" />
        <div className="h-32 bg-cream-dark rounded-2xl" />
        <div className="h-48 bg-cream-dark rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <XCircle size={48} className="mx-auto text-sand mb-4" />
        <p className="text-ink-light">Order tidak ditemukan</p>
        <Link
          href="/orders"
          className="text-sm text-terracotta hover:underline mt-2 inline-block"
        >
          Kembali ke pesanan
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-ink-light hover:text-ink transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-ink">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-ink-light mt-0.5">
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
        <div className="bg-cream-dark rounded-2xl border-2 border-sand p-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-sand mx-8" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-ink mx-8 transition-all"
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border-2 ${
                      isCompleted
                        ? "bg-ink border-ink text-cream"
                        : "bg-cream border-sand text-sand"
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  <p
                    className={`text-[10px] text-center max-w-15 leading-tight ${
                      isCompleted ? "text-ink font-medium" : "text-ink-light"
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

      {/* Bayar Sekarang */}
      {order.status === "WAITING_PAYMENT" && order.midtrans_url && (
        <a
          href={order.midtrans_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-terracotta text-white rounded-2xl text-sm font-semibold text-center border-2 border-ink shadow-brutal hover:bg-terracotta-dark transition-colors"
        >
          Bayar Sekarang
        </a>
      )}

      {/* Info Toko + Items */}
      <div className="bg-cream-dark rounded-2xl border-2 border-sand p-5 space-y-4">
        <Link
          href={`/stores/${order.store.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-terracotta transition-colors"
        >
          <Store size={14} className="text-ink-light" />
          {order.store.name}
        </Link>

        <div className="space-y-4">
          {order.items.map((item) => {
            const alreadyReviewed = reviewedItems.has(item.variant.product.id);
            return (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream border-2 border-sand shrink-0">
                  {item.variant.product.images[0] ? (
                    <Image
                      src={item.variant.product.images[0].url}
                      alt={item.variant.product.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={16} className="text-sand" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.variant.product.slug}`}>
                    <p className="text-sm font-semibold text-ink hover:text-terracotta transition-colors line-clamp-1">
                      {item.variant.product.name}
                    </p>
                  </Link>
                  <p className="text-xs text-ink-light mt-0.5">
                    {item.variant.name} × {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-terracotta mt-1">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>
                {/* Tombol Review */}
                {isDelivered && (
                  <div className="shrink-0 flex items-center">
                    {alreadyReviewed ? (
                      <span className="text-xs text-sage flex items-center gap-1 font-medium">
                        <CheckCircle size={13} /> Diulas
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          openReview(
                            item.variant.product.id,
                            item.variant.product.name,
                          )
                        }
                        className="text-xs px-3 py-1.5 rounded-xl border-2 border-sand hover:border-terracotta hover:text-terracotta text-ink-light font-medium transition-all"
                      >
                        Beri Ulasan
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alamat */}
      <div className="bg-cream-dark rounded-2xl border-2 border-sand p-5 space-y-2">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <MapPin size={14} className="text-terracotta" /> Alamat Pengiriman
        </h2>
        <p className="text-sm font-semibold text-ink">
          {order.address.recipient}
        </p>
        <p className="text-xs text-ink-light">{order.address.phone}</p>
        <p className="text-xs text-ink-light leading-relaxed">
          {order.address.full_address}, {order.address.district},{" "}
          {order.address.city}, {order.address.province}{" "}
          {order.address.postal_code}
        </p>
      </div>

      {/* Pengiriman */}
      {order.shipment && (
        <div className="bg-cream-dark rounded-2xl border-2 border-sand p-5 space-y-2">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Truck size={14} className="text-terracotta" /> Info Pengiriman
          </h2>
          <p className="text-sm text-ink">
            {order.shipment.courier} - {order.shipment.service}
          </p>
          {order.shipment.tracking_number && (
            <p className="text-xs text-ink-light">
              No. Resi:{" "}
              <span className="font-mono font-semibold text-ink">
                {order.shipment.tracking_number}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Ringkasan Pembayaran */}
      <div className="bg-cream-dark rounded-2xl border-2 border-sand p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink">Ringkasan Pembayaran</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-ink-light">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-light">
            <span>Ongkos Kirim</span>
            <span>{formatPrice(Number(order.shipping_cost))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-sm text-sage">
              <span>Diskon</span>
              <span>-{formatPrice(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ink pt-2 border-t-2 border-sand">
            <span>Total</span>
            <span className="text-terracotta">
              {formatPrice(Number(order.total))}
            </span>
          </div>
        </div>
      </div>

      {/* ===== REVIEW MODAL ===== */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-cream rounded-2xl border-2 border-ink shadow-brutal p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Beri Ulasan
                </h3>
                <p className="text-xs text-ink-light mt-0.5 line-clamp-1">
                  {reviewModal.productName}
                </p>
              </div>
              <button
                onClick={() => setReviewModal(null)}
                className="text-ink-light hover:text-ink transition-colors mt-0.5"
              >
                <X size={18} />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="mx-auto text-sage mb-3" />
                <p className="font-semibold text-ink">
                  Ulasan berhasil dikirim!
                </p>
                <p className="text-xs text-ink-light mt-1">
                  Terima kasih sudah memberi ulasan
                </p>
              </div>
            ) : (
              <>
                {/* Star Rating */}
                <div>
                  <p className="text-sm font-medium text-ink mb-3">Rating</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={`transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-gold text-gold"
                              : "text-sand fill-sand"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-ink-light ml-1">
                      {
                        [
                          "",
                          "Sangat Buruk",
                          "Buruk",
                          "Cukup",
                          "Bagus",
                          "Sangat Bagus",
                        ][hoverRating || rating]
                      }
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-sm font-medium text-ink mb-2">
                    Komentar (opsional)
                  </p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Ceritakan pengalamanmu dengan produk ini..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-sand bg-cream-dark text-sm text-ink placeholder:text-ink-light/60 focus:outline-none focus:border-terracotta resize-none transition-colors"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full py-3 bg-terracotta text-white rounded-xl text-sm font-semibold border-2 border-ink shadow-brutal hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
