"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Zap,
  AlertCircle,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  revenue: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  user: { name: string };
  items: { quantity: number; variant: { product: { name: string } } }[];
}

interface DailyRevenue {
  day: string;
  revenue: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return n.toString();
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
  WAITING_PAYMENT: {
    label: "Menunggu",
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
    color: "bg-red-50 text-red-400",
    dot: "bg-red-400",
  },
};

function MiniBarChart({ data }: { data: DailyRevenue[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-1.5 h-14">
      {data.map((d) => {
        const pct = (d.revenue / max) * 100;
        return (
          <div
            key={d.day}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            {/* Tooltip */}
            {d.revenue > 0 && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {fmtShort(d.revenue)}
              </div>
            )}
            <div className="w-full flex items-end" style={{ height: "44px" }}>
              <div
                className={`w-full rounded-t-sm transition-all ${d.revenue > 0 ? "bg-gray-900" : "bg-gray-100"}`}
                style={{ height: `${Math.max(pct, d.revenue > 0 ? 8 : 4)}%` }}
              />
            </div>
            <p className="text-[9px] text-gray-400">{d.day}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [storeName, setStoreName] = useState("");
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setStats(d.stats);
        setRecentOrders(d.recentOrders || []);
        setStoreName(d.store?.name || "");
        setDailyRevenue(d.dailyRevenue || []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 h-28"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 h-72" />
          <div className="bg-white rounded-2xl border border-gray-100 h-72" />
        </div>
      </div>
    );
  }

  const needsAction =
    (stats?.pendingOrders ?? 0) + (stats?.processingOrders ?? 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gray-900 rounded-2xl px-6 py-5 flex items-center justify-between">
        {/* BG decoration */}
        <div className="absolute right-0 top-0 w-64 h-full opacity-5">
          <div className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-2 right-2 w-20 h-20 bg-white rounded-full" />
        </div>
        <div className="relative">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
            {greeting} 👋
          </p>
          <h1 className="text-white text-2xl font-bold mt-0.5 tracking-tight">
            {storeName}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {needsAction > 0 && (
          <Link
            href="/dashboard/orders"
            className="relative flex items-center gap-2 bg-white text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
          >
            <AlertCircle size={14} className="text-amber-500" />
            {needsAction} perlu ditindak
            <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Produk Aktif",
            value: stats?.totalProducts ?? 0,
            icon: Package,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            sub: "produk",
            href: "/dashboard/products",
          },
          {
            label: "Total Order",
            value: stats?.totalOrders ?? 0,
            icon: ShoppingBag,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
            sub: "pesanan",
            href: "/dashboard/orders",
          },
          {
            label: "Perlu Ditindak",
            value: needsAction,
            icon: Clock,
            iconBg: needsAction > 0 ? "bg-amber-50" : "bg-gray-50",
            iconColor: needsAction > 0 ? "text-amber-500" : "text-gray-400",
            sub: "order aktif",
            href: "/dashboard/orders",
            alert: needsAction > 0,
          },
          {
            label: "Total Revenue",
            value: fmtShort(Number(stats?.revenue ?? 0)),
            icon: TrendingUp,
            iconBg: "bg-green-50",
            iconColor: "text-green-500",
            sub: fmt(Number(stats?.revenue ?? 0)),
            href: "/dashboard/orders",
            isString: true,
          },
        ].map(
          ({
            label,
            value,
            icon: Icon,
            iconBg,
            iconColor,
            sub,
            href,
            alert,
            isString,
          }) => (
            <Link
              key={label}
              href={href}
              className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all group ${
                alert
                  ? "border-amber-200"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}
                >
                  <Icon size={18} className={iconColor} />
                </div>
                <ArrowRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {isString ? value : value.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              {isString && (
                <p className="text-[11px] text-gray-300 mt-0.5 truncate">
                  {sub}
                </p>
              )}
            </Link>
          ),
        )}
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-gray-900">
                Order Terbaru
              </h2>
            </div>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-900 transition-colors"
            >
              Lihat semua <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={22} className="text-gray-200" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                Belum ada pesanan
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Pesanan akan muncul di sini
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const cfg =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                const firstProduct = order.items[0]?.variant?.product?.name;
                const totalItems = order.items.reduce(
                  (s, i) => s + i.quantity,
                  0,
                );
                return (
                  <Link
                    key={order.id}
                    href="/dashboard/orders"
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Status dot */}
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                    />

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {order.user?.name} · {firstProduct}
                        {totalItems > 1 ? ` +${totalItems - 1} lainnya` : ""}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {fmt(Number(order.total))}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue Chart + Quick Actions — 1/3 width */}
        <div className="space-y-4">
          {/* Mini Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Revenue 7 Hari
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {fmtShort(dailyRevenue.reduce((s, d) => s + d.revenue, 0))}
                </p>
              </div>
            </div>
            {dailyRevenue.length > 0 ? (
              <MiniBarChart data={dailyRevenue} />
            ) : (
              <div className="h-14 flex items-center justify-center">
                <p className="text-xs text-gray-300">Belum ada data</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Aksi Cepat
            </p>
            <div className="space-y-1.5">
              {[
                {
                  href: "/dashboard/products/create",
                  icon: Package,
                  label: "Tambah Produk Baru",
                  color: "text-blue-500",
                },
                {
                  href: "/dashboard/orders",
                  icon: ShoppingBag,
                  label: "Kelola Pesanan",
                  color: "text-purple-500",
                },
                {
                  href: "/dashboard/vouchers",
                  icon: CheckCircle2,
                  label: "Buat Voucher",
                  color: "text-green-500",
                },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                    <Icon size={14} className={color} />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {label}
                  </span>
                  <ChevronRight
                    size={13}
                    className="text-gray-300 ml-auto group-hover:text-gray-500 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
