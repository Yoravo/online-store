"use client";

import { useCallback, useEffect, useState } from "react";
import { Ticket, Plus, Trash2, X, Percent, DollarSign } from "lucide-react";

interface Voucher {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  min_purchase: number;
  quota: number;
  used: number;
  expired_at: string;
  created_at: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function DashboardVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    minPurchase: "",
    quota: "",
    expiredAt: "",
  });

  const fetchVouchers = useCallback(() => {
    fetch("/api/dashboard/vouchers")
      .then((r) => r.json())
      .then((data) => setVouchers(data.vouchers || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const res = await fetch("/api/dashboard/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minPurchase: Number(form.minPurchase) || 0,
        quota: Number(form.quota),
        expiredAt: form.expiredAt,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setFormError(data.message);
      setSaving(false);
      return;
    }

    setForm({
      code: "",
      type: "PERCENTAGE",
      value: "",
      minPurchase: "",
      quota: "",
      expiredAt: "",
    });
    setShowForm(false);
    setSaving(false);
    fetchVouchers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus voucher ini?")) return;
    setDeletingId(id);
    await fetch(`/api/dashboard/vouchers/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchVouchers();
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voucher</h1>
          <p className="text-sm text-gray-400 mt-1">
            Kelola voucher diskon toko kamu
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700
  transition-colors"
        >
          <Plus size={15} /> Buat Voucher
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Voucher Baru
            </h2>
            <button onClick={() => setShowForm(false)}>
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Kode Voucher
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="DISKON20"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Tipe
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      type: e.target.value as "PERCENTAGE" | "FIXED",
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black
  bg-white"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  {form.type === "PERCENTAGE" ? "Nilai (%)" : "Nilai (Rp)"}
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, value: e.target.value }))
                  }
                  min="1"
                  max={form.type === "PERCENTAGE" ? "100" : undefined}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Min. Pembelian (Rp)
                </label>
                <input
                  type="number"
                  value={form.minPurchase}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, minPurchase: e.target.value }))
                  }
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Kuota
                </label>
                <input
                  type="number"
                  value={form.quota}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quota: e.target.value }))
                  }
                  min="1"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Berlaku Sampai
                </label>
                <input
                  type="date"
                  value={form.expiredAt}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expiredAt: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors
  disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Voucher"}
            </button>
            {formError && <p className="text-xs text-red-500">{formError}</p>}
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Belum ada voucher</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Kode
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Diskon
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Min. Beli
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Kuota
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Expired
                </th>
                <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vouchers.map((v) => {
                const expired = isExpired(v.expired_at);
                return (
                  <tr
                    key={v.id}
                    className={`hover:bg-gray-50 transition-colors ${expired ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-semibold text-gray-900">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                        {v.type === "PERCENTAGE" ? (
                          <Percent size={12} />
                        ) : (
                          <DollarSign size={12} />
                        )}
                        {v.type === "PERCENTAGE"
                          ? `${Number(v.value)}%`
                          : fmt(Number(v.value))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {Number(v.min_purchase) > 0
                          ? fmt(Number(v.min_purchase))
                          : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {v.used}/{v.quota}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${expired ? "text-red-400" : "text-gray-500"}`}
                      >
                        {new Date(v.expired_at).toLocaleDateString("id-ID")}
                        {expired && (
                          <span className="ml-1.5 text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 rounded-md">
                            Expired
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
  transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
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
