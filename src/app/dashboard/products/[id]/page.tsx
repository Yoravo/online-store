"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2, Plus } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, catRes] = await Promise.all([
          fetch(`/api/dashboard/products/${productId}`),
          fetch("/api/categories"),
        ]);
        if (!productRes.ok) throw new Error("Produk tidak ditemukan");
        const { product } = await productRes.json();
        const { categories: cats } = await catRes.json();

        setName(product.name);
        setDescription(product.description || "");
        setCategoryId(product.category?.id || "");
        setIsActive(product.is_active);
        setVariants(
          product.variants.map((v: Variant) => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            stock: v.stock,
            sku: v.sku,
          })),
        );
        setImages(product.images || []);
        setCategories(cats);
      } catch {
        setError("Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleVariantChange = (
    index: number,
    field: keyof Omit<Variant, "id">,
    value: string | number,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setImages((prev) => [
        ...prev,
        { id: "", url: data.url, is_primary: prev.length === 0 },
      ]);
    } catch {
      setError("Gagal upload gambar");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index })),
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          categoryId,
          isActive,
          variants,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan");
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/products"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Perbarui informasi produk kamu
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gambar Produk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900">Gambar Produk</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200"
              >
                <Image src={img.url} alt="" fill className="object-cover" />
                {img.is_primary && (
                  <span className="absolute top-1 left-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-md">
                    Utama
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="text-[10px] bg-white text-black px-2 py-1 rounded-lg font-medium"
                    >
                      Utama
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <label
              className={`aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={20} className="text-gray-300" />
                  <span className="text-xs text-gray-400 mt-1">Upload</span>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-400">JPG, PNG, WebP • Maks 2MB</p>
        </div>

        {/* Info Produk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900">
            Informasi Produk
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Produk
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              Produk aktif (langsung tampil di toko)
            </span>
          </label>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900">Varian Produk</h2>
          <div className="space-y-4">
            {variants.map((v, i) => (
              <div key={v.id} className="p-4 rounded-xl bg-gray-50 space-y-3">
                <span className="text-xs font-medium text-gray-500">
                  Varian {i + 1}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Nama Varian
                    </label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) =>
                        handleVariantChange(i, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      SKU (opsional)
                    </label>
                    <input
                      type="text"
                      value={v.sku || ""}
                      onChange={(e) =>
                        handleVariantChange(i, "sku", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) =>
                        handleVariantChange(i, "price", Number(e.target.value))
                      }
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        handleVariantChange(i, "stock", Number(e.target.value))
                      }
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-xl">
            Produk berhasil disimpan! Mengalihkan...
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
