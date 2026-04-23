"use client";

import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { ShoppingCart, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = () => {
      if (user) {
        fetch("/api/cart")
          .then((res) => res.json())
          .then((data) => setCartCount(data.cart?.items?.length || 0));
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();

    // Dengerin event update cart
    window.addEventListener("cart:updated", fetchCartCount);
    return () => window.removeEventListener("cart:updated", fetchCartCount);
  }, [user]);

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

            {/* Tambah ini */}
            {user && user.role === "BUYER" && (
              <Link
                href="/open-store"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Buka Toko
              </Link>
            )}

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
                  className="relative text-gray-600 hover:text-black transition-colors"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
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
