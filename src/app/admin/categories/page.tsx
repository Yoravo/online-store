"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronRight,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  children: { id: string; name: string; slug: string }[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    setFormError("");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formName, parentId: formParentId || null }),
    });
    const data = await res.json();

    if (!res.ok) {
      setFormError(data.message);
      setSaving(false);
      return;
    }

    setFormName("");
    setFormParentId("");
    setShowForm(false);
    setSaving(false);
    fetchCategories();
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
    }
    setDeletingId(null);
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
          <p className="text-sm text-gray-400 mt-1">
            Atur kategori produk marketplace
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700
  transition-colors"
        >
          <Plus size={15} /> Tambah Kategori
        </button>
      </div>

      {/* Form tambah */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Kategori Baru
            </h2>
            <button onClick={() => setShowForm(false)}>
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5">
                Nama Kategori
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Elektronik"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="w-48">
              <label className="block text-xs text-gray-500 mb-1.5">
                Parent (opsional)
              </label>
              <select
                value={formParentId}
                onChange={(e) => setFormParentId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="">Tanpa parent</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors
  disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
          {formError && (
            <p className="text-xs text-red-500 mt-2">{formError}</p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Belum ada kategori</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Kategori
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Slug
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Sub-kategori
                </th>
                <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEdit(cat.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100
  transition-colors"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200
  transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {cat.name}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400">/{cat.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    {cat.children.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.children.map((child) => (
                          <span
                            key={child.id}
                            className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                          >
                            <ChevronRight size={10} /> {child.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50
  transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
  transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
