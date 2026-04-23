"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  Users,
  Tag,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/stores", label: "Toko", icon: Store },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Kategori", icon: Tag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-950 min-h-screen flex flex-col fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-white font-bold text-lg tracking-tight">
              TokoKu
            </span>
            <span className="text-[10px] font-medium bg-white/10 text-white/60 px-1.5 py-0.5 rounded-md">
              ADMIN
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-white text-gray-900 font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {label}
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-gray-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-white/40 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
