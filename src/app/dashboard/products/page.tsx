"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  category: { name: string };
  variants: { price: number; stock: number }[];
  images: { url: string }[];
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = () => {
    fetch("/api/dashboard/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin mau hapus produk ini?")) return;
    setDeletingId(id);
    await fetch(`/api/dashboard/products/${id}`, { method: "DELETE" });
    fetchProducts();
    setDeletingId(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-sm text-gray-400 mt-1">
            {products.length} produk terdaftar
          </p>
        </div>
        <Link
          href="/dashboard/products/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Tambah Produk
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-4"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm mb-4">Belum ada produk</p>
          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            Tambah Produk Pertama
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Produk
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Kategori
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Harga
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Stok
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const minPrice = Math.min(
                  ...product.variants.map((v) => Number(v.price)),
                );
                const maxPrice = Math.max(
                  ...product.variants.map((v) => Number(v.price)),
                );
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0,
                );

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${deletingId === product.id ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package size={16} className="text-gray-300" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {product.category.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {minPrice === maxPrice
                          ? formatPrice(minPrice)
                          : `${formatPrice(minPrice)} — ${formatPrice(maxPrice)}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{totalStock}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${product.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="p-1.5 text-gray-400 hover:text-black transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={!!deletingId}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
