"use client";

import { useEffect, useReducer, useState } from "react";
import Image from "next/image";
import {
  User, Mail, MapPin, Plus, Pencil, Trash2,
  Check, X, Shield, ChevronRight, Star,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  city: string;
  province: string;
  district: string;
  postal_code: string;
  full_address: string;
  is_default: boolean;
}

type State = {
  user: UserProfile | null;
  addresses: Address[];
  loading: boolean;
};

type Action =
  | { type: "INIT"; user: UserProfile; addresses: Address[] }
  | { type: "UPDATE_USER"; user: UserProfile }
  | { type: "ADD_ADDRESS"; address: Address }
  | { type: "DELETE_ADDRESS"; id: string }
  | { type: "SET_DEFAULT"; id: string }
  | { type: "SET_LOADED" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "INIT": return { user: a.user, addresses: a.addresses, loading: false };
    case "SET_LOADED": return { ...s, loading: false };
    case "UPDATE_USER": return { ...s, user: a.user };
    case "ADD_ADDRESS": return { ...s, addresses: [...s.addresses, a.address] };
    case "DELETE_ADDRESS": return { ...s, addresses: s.addresses.filter((addr) => addr.id !== a.id) };
    case "SET_DEFAULT": return {
      ...s,
      addresses: s.addresses.map((addr) => ({ ...addr, is_default: addr.id === a.id })),
    };
    default: return s;
  }
}

const EMPTY_FORM = {
  label: "", recipient: "", phone: "",
  province: "", city: "", district: "",
  postal_code: "", full_address: "",
};

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Pembeli",
  SELLER: "Penjual",
  ADMIN: "Admin",
};

export default function ProfilePage() {
  const [state, dispatch] = useReducer(reducer, { user: null, addresses: [], loading: true });
  const { user, addresses, loading } = state;

  // Edit profile
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Add address
  const [showAddForm, setShowAddForm] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/addresses").then((r) => r.json()),
    ]).then(([userData, addrData]) => {
      if (cancelled) return;
      dispatch({
        type: "INIT",
        user: userData.user,
        addresses: addrData.addresses || addrData.adresses || [],
      });
    }).catch(() => { if (!cancelled) dispatch({ type: "SET_LOADED" }); });
    return () => { cancelled = true; };
  }, []);

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) return;
    setSavingProfile(true);
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput }),
    });
    const data = await res.json();
    if (res.ok) {
      dispatch({ type: "UPDATE_USER", user: data.user });
      setEditingProfile(false);
    }
    setSavingProfile(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    const data = await res.json();
    if (res.ok) {
      dispatch({ type: "ADD_ADDRESS", address: data.address });
      setShowAddForm(false);
      setAddressForm(EMPTY_FORM);
    }
    setSavingAddress(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Hapus alamat ini?")) return;
    setDeletingId(id);
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    dispatch({ type: "DELETE_ADDRESS", id });
    setDeletingId(null);
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: true }),
    });
    dispatch({ type: "SET_DEFAULT", id });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-400 text-sm">Silakan login terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-sm text-gray-400 mt-0.5">Kelola informasi akun dan alamat pengiriman</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-20 bg-linear-to-r from-gray-900 to-gray-700" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow-md">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand/10">
                  <User size={32} className="text-brand" />
                </div>
              )}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              user.role === "ADMIN" ? "bg-red-50 text-red-500" :
              user.role === "SELLER" ? "bg-purple-50 text-purple-600" :
              "bg-blue-50 text-blue-600"
            }`}>
              {ROLE_LABEL[user.role] || user.role}
            </span>
          </div>

          {/* Info */}
          {editingProfile ? (
            <div className="space-y-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand transition-colors"
                placeholder="Nama lengkap"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !nameInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  <Check size={14} /> {savingProfile ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} /> Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400">
                  <Mail size={13} />
                  <span>{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => { setEditingProfile(true); setNameInput(user.name); }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
              >
                <Pencil size={13} /> Edit
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { icon: Shield, label: "Status", value: "Terverifikasi", color: "text-green-500" },
              { icon: Star, label: "Member", value: "Aktif", color: "text-amber-400" },
              { icon: MapPin, label: "Alamat", value: `${addresses.length} lokasi`, color: "text-blue-500" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center">
                <Icon size={18} className={`mx-auto ${color} mb-1`} />
                <p className="text-sm font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {[
          { href: "/orders", label: "Pesanan Saya", sub: "Lihat riwayat pembelian", icon: "📦" },
          { href: "/wishlist", label: "Wishlist", sub: "Produk yang kamu simpan", icon: "❤️" },
          ...(user.role === "SELLER" ? [{ href: "/dashboard", label: "Dashboard Penjual", sub: "Kelola toko kamu", icon: "🏪" }] : []),
        ].map((item) => (
          <a key={item.href} href={item.href} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </a>
        ))}
      </div>

      {/* Alamat */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={15} className="text-brand" /> Alamat Pengiriman
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-semibold transition-colors"
          >
            <Plus size={13} /> Tambah
          </button>
        </div>

        {/* Form tambah */}
        {showAddForm && (
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900 mb-3">Alamat Baru</p>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "label", placeholder: "Label (Rumah, Kantor)", col: 2 },
                  { name: "recipient", placeholder: "Nama Penerima", col: 1 },
                  { name: "phone", placeholder: "No. Telepon", col: 1 },
                  { name: "province", placeholder: "Provinsi", col: 1 },
                  { name: "city", placeholder: "Kota/Kabupaten", col: 1 },
                  { name: "district", placeholder: "Kecamatan", col: 1 },
                  { name: "postal_code", placeholder: "Kode Pos", col: 1 },
                ].map((f) => (
                  <input
                    key={f.name}
                    type="text"
                    placeholder={f.placeholder}
                    value={addressForm[f.name as keyof typeof addressForm]}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    required
                    className={`px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-brand transition-colors ${f.col === 2 ? "col-span-2" : ""}`}
                  />
                ))}
              </div>
              <textarea
                placeholder="Alamat lengkap"
                value={addressForm.full_address}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, full_address: e.target.value }))}
                required rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-brand transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button type="submit" disabled={savingAddress}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50">
                  {savingAddress ? "Menyimpan..." : "Simpan Alamat"}
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setAddressForm(EMPTY_FORM); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List alamat */}
        {addresses.length === 0 && !showAddForm ? (
          <div className="py-12 text-center">
            <MapPin size={28} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Belum ada alamat tersimpan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`px-5 py-4 ${deletingId === addr.id ? "opacity-40 pointer-events-none" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{addr.label}</span>
                      {addr.is_default && (
                        <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-md font-semibold">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{addr.recipient} · {addr.phone}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {addr.full_address}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!addr.is_default && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs text-brand hover:text-brand-dark font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                      >
                        Utamakan
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      {deletingId === addr.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}