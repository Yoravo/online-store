"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, Store, User } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  avatar: string | null;
  created_at: string;
  _count: { orders: number; reviews: number };
  store?: { name: string; status: string } | null;
}

const roleConfig = {
  BUYER: { label: "Pembeli", color: "bg-blue-50 text-blue-600", icon: User },
  SELLER: {
    label: "Penjual",
    color: "bg-purple-50 text-purple-600",
    icon: Store,
  },
  ADMIN: { label: "Admin", color: "bg-red-50 text-red-500", icon: ShieldCheck },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = filter ? `?role=${filter}` : "";
    fetch(`/api/admin/users${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setUsers(data.users || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const handleRoleChange = async (id: string, role: string) => {
    setChangingRole(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message);
    }
    setFilter((f) => f);
    setChangingRole(null);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Users</h1>
        <p className="text-sm text-gray-400 mt-1">
          Lihat dan atur role pengguna
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "", label: "Semua" },
          { value: "BUYER", label: "Pembeli" },
          { value: "SELLER", label: "Penjual" },
          { value: "ADMIN", label: "Admin" },
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
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Tidak ada user</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Toko
                </th>
                <th className="text-left text-xs font-medium text-gray-400 px-6 py-4">
                  Bergabung
                </th>
                <th className="text-right text-xs font-medium text-gray-400 px-6 py-4">
                  Ubah Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const role = roleConfig[u.role];
                const RoleIcon = role.icon;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${role.color}`}
                      >
                        <RoleIcon size={11} /> {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.store && u.store.status === "ACTIVE" ? (
                        <p className="text-sm text-gray-600">{u.store.name}</p>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-400">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          disabled={changingRole === u.id}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2
  focus:ring-black disabled:opacity-40"
                        >
                          <option value="BUYER">Pembeli</option>
                          <option value="SELLER">Penjual</option>
                          <option value="ADMIN">Admin</option>
                        </select>
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
