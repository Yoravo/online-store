"use client";

import { useCallback, useEffect, useState } from "react";
import { Store, Check, X, Ban, Clock } from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  description: string | null;
  created_at: string;
  user: { id: string; name: string; email: string };
}

const statusConfig = {
  PENDING: {
    label: "Menunggu",
    color: "bg-amber-50 text-amber-600",
    icon: Clock,
  },
  ACTIVE: { label: "Aktif", color: "bg-green-50 text-green-600", icon: Check },
  REJECTED: { label: "Ditolak", color: "bg-red-50 text-red-500", icon: X },
  SUSPENDED: {
    label: "Suspend",
    color: "bg-gray-100 text-gray-500",
    icon: Ban,
  },
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch stores 
  const fetchStores = useCallback(() => {
    const params = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/stores${params}`)
      .then((res) => res.json())
      .then((data) => setStores(data.stores || []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "suspend" | "reactivate",
  ) => {
    setActionLoading(id + action);
    await fetch(`/api/admin/stores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchStores();
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Toko</h1>
          <p className="text-sm text-gray-400 mt-1">
            Review dan approve pengajuan toko
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "", label: "Semua" },
          { value: "PENDING", label: "Menunggu" },
          { value: "ACTIVE", label: "Aktif" },
          { value: "SUSPENDED", label: "Suspend" },
          { value: "REJECTED", label: "Ditolak" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
        ) : stores.length === 0 ? (
          <div className="p-12 text-center">
            <Store size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Tidak ada toko</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Toko
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Pemilik
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Tanggal
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stores.map((store) => {
                const status = statusConfig[store.status];
                const StatusIcon = status.icon;
                return (
                  <tr
                    key={store.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {store.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        /{store.slug}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{store.user.name}</p>
                      <p className="text-xs text-gray-400">
                        {store.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.color}`}
                      >
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-400">
                        {new Date(store.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-2">
                        {store.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleAction(store.id, "approve")}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                            >
                              <Check size={12} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(store.id, "reject")}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </>
                        )}
                        {store.status === "ACTIVE" && (
                          <button
                            onClick={() => handleAction(store.id, "suspend")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            <Ban size={12} />
                            Suspend
                          </button>
                        )}
                        {(store.status === "REJECTED" ||
                          store.status === "SUSPENDED") && (
                          <button
                            onClick={() => handleAction(store.id, "reactivate")}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            <Check size={12} />
                            Aktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
