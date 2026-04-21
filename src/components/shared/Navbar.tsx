"use client";

import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { ShoppingCart, LogOut, LayoutDashboard, Shield } from 'lucide-react'

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-black tracking-tight"
          >
            TokoKu
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Produk
            </Link>
            {user?.role === "SELLER" || user?.role === "ADMIN" ? (
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Dashboard
              </Link>
            ) : null}
            {user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Admin
              </Link>
            ) : null}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/cart"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  <ShoppingCart size={20} />
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Hi, {user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm px-4 py-2 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 cursor-pointer transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
