"use client";

import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import {
  ShoppingCart,
  LogOut,
  Heart,
  Bell,
  X,
  Menu,
  Store,
  LayoutDashboard,
  ShieldCheck,
  Package,
  ChevronDown,
  User,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

import SearchAutocomplete from "@/src/components/shared/SearchAutocomplete";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
};

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCartCount = () => {
      if (user) {
        fetch("/api/cart")
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => setCartCount(d?.cart?.items?.length || 0))
          .catch(() => {});
      } else {
        setCartCount(0);
      }
    };
    fetchCartCount();
    window.addEventListener("cart:updated", fetchCartCount);
    return () => window.removeEventListener("cart:updated", fetchCartCount);
  }, [user]);

  const fetchNotifications = useCallback(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setShowNotif(false);
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  const handleOpenNotif = () => {
    setShowNotif((p) => !p);
    setShowUserMenu(false);
    if (unreadCount > 0) {
      fetch("/api/notifications", { method: "PATCH" }).then(() => {
        setUnreadCount(0);
        setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
      });
    }
  };

  const closeMobile = () => setShowMobileMenu(false);

  return (
    <>
      {/* Top bar — kategori & promo */}
      <div className="hidden md:block bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="flex items-center gap-4 text-gray-300">
              <span>📦 Gratis ongkir untuk order pertama</span>
              <span>·</span>
              <span>🔒 Pembayaran aman & terpercaya</span>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Masuk
                  </Link>
                  <span>|</span>
                  <Link
                    href="/register"
                    className="hover:text-white transition-colors"
                  >
                    Daftar
                  </Link>
                </>
              )}
              {user?.role === "SELLER" && (
                <Link
                  href="/dashboard"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard size={12} /> Dashboard Penjual
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className="sticky top-0 z-40 w-full bg-white border-b border-gray-200"
        style={{ boxShadow: "0 1px 3px rgb(0 0 0 / 0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-xl font-bold text-brand shrink-0"
              onClick={closeMobile}
            >
              TokoKu
            </Link>

            {/* Search Bar — center, desktop */}
            <SearchAutocomplete className="hidden md:flex flex-1 max-w-xl" />

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {loading ? (
                <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />
              ) : user ? (
                <>
                  {/* Wishlist */}
                  <NavIconBtn
                    href="/wishlist"
                    label="Wishlist"
                    className="hidden sm:flex"
                  >
                    <Heart size={20} />
                  </NavIconBtn>

                  {/* Cart */}
                  <NavIconBtn href="/cart" label="Keranjang" badge={cartCount}>
                    <ShoppingCart size={20} />
                  </NavIconBtn>

                  {/* Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={handleOpenNotif}
                      className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-gray-600 hover:text-brand hover:bg-brand-50 transition-colors"
                    >
                      <div className="relative">
                        <Bell size={20} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium hidden sm:block">
                        Notifikasi
                      </span>
                    </button>

                    {/* Notif Panel */}
                    {showNotif && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowNotif(false)}
                        />
                        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <span className="text-sm font-semibold text-gray-900">
                              Notifikasi
                            </span>
                            {unreadCount === 0 && notifications.length > 0 && (
                              <span className="text-xs text-gray-400">
                                Semua sudah dibaca
                              </span>
                            )}
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                            {notifications.length === 0 ? (
                              <div className="py-10 text-center">
                                <Bell
                                  size={28}
                                  className="mx-auto text-gray-200 mb-2"
                                />
                                <p className="text-xs text-gray-400">
                                  Belum ada notifikasi
                                </p>
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  className={`px-4 py-3 ${!n.is_read ? "bg-orange-50" : ""}`}
                                >
                                  <div className="flex gap-2">
                                    {!n.is_read && (
                                      <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 shrink-0" />
                                    )}
                                    <div className={!n.is_read ? "" : "ml-3.5"}>
                                      <p className="text-xs font-semibold text-gray-900">
                                        {n.title}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {n.message}
                                      </p>
                                      <p className="text-[10px] text-gray-400 mt-1">
                                        {timeAgo(n.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          {notifications.length > 0 && (
                            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                              <Link
                                href="/orders"
                                onClick={() => setShowNotif(false)}
                                className="text-xs text-brand font-medium hover:text-brand-dark"
                              >
                                Lihat semua pesanan →
                              </Link>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* User Menu — desktop */}
                  <div className="relative hidden sm:block" ref={userMenuRef}>
                    <button
                      onClick={() => {
                        setShowUserMenu((p) => !p);
                        setShowNotif(false);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-600 hover:text-brand hover:bg-brand-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
                        <User size={14} className="text-brand" />
                      </div>
                      <div className="hidden lg:flex flex-col items-start">
                        <span className="text-[10px] text-gray-400">Halo,</span>
                        <span className="text-xs font-semibold text-gray-800 leading-tight">
                          {user.name.split(" ")[0]}
                        </span>
                      </div>
                      <ChevronDown size={13} className="text-gray-400" />
                    </button>

                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 capitalize mt-0.5">
                              {user.role?.toLowerCase()}
                            </p>
                          </div>
                          <UserMenuItem
                            href="/profile"
                            icon={<User size={15} />}
                            label="Profil Saya"
                            onClick={() => setShowUserMenu(false)}
                          />
                          <UserMenuItem
                            href="/orders"
                            icon={<Package size={15} />}
                            label="Pesanan Saya"
                            onClick={() => setShowUserMenu(false)}
                          />
                          <UserMenuItem
                            href="/wishlist"
                            icon={<Heart size={15} />}
                            label="Wishlist"
                            onClick={() => setShowUserMenu(false)}
                          />
                          {user.role === "SELLER" && (
                            <UserMenuItem
                              href="/dashboard"
                              icon={<LayoutDashboard size={15} />}
                              label="Dashboard"
                              onClick={() => setShowUserMenu(false)}
                            />
                          )}
                          {user.role === "ADMIN" && (
                            <UserMenuItem
                              href="/admin"
                              icon={<ShieldCheck size={15} />}
                              label="Admin Panel"
                              onClick={() => setShowUserMenu(false)}
                            />
                          )}
                          {user.role === "BUYER" && (
                            <UserMenuItem
                              href="/open-store"
                              icon={<Store size={15} />}
                              label="Buka Toko"
                              onClick={() => setShowUserMenu(false)}
                            />
                          )}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={() => {
                                logout();
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={15} /> Keluar
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Hamburger — mobile */}
                  <button
                    onClick={() => setShowMobileMenu((p) => !p)}
                    aria-label={showMobileMenu ? "Tutup menu" : "Buka menu"}
                    aria-expanded={showMobileMenu}
                    className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="hidden sm:block text-sm font-medium text-gray-600 hover:text-brand px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold text-white bg-brand hover:bg-brand-dark px-4 py-2 rounded-lg transition-colors"
                  >
                    Daftar
                  </Link>
                  <button
                    onClick={() => setShowMobileMenu((p) => !p)}
                    aria-label="Buka menu"
                    className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Menu size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <SearchAutocomplete />
          </div>
        </div>

        {/* Bottom Nav Category Bar — desktop */}
        <div className="hidden md:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 h-10 text-xs font-medium text-gray-500 overflow-x-auto">
              {[
                "Fashion",
                "Elektronik",
                "Makanan",
                "Kecantikan",
                "Rumah",
                "Olahraga",
                "Buku",
                "Otomotif",
              ].map((cat) => (
                <Link
                  key={cat}
                  href={`/products?category=${cat.toLowerCase()}`}
                  className="hover:text-brand whitespace-nowrap transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Notif Bottom Sheet */}
      {showNotif && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setShowNotif(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[50vh] flex flex-col sm:hidden">
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-9 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <span className="text-sm font-semibold">Notifikasi</span>
              <button onClick={() => setShowNotif(false)}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-xs text-gray-400">Belum ada notifikasi</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 ${!n.is_read ? "bg-orange-50" : ""}`}
                  >
                    <p className="text-xs font-semibold text-gray-900">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={closeMobile}
          />
          <div className="fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-xl sm:hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-display font-bold text-gray-900">Menu</span>
              <button onClick={closeMobile} aria-label="Tutup menu">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {user && (
              <div className="px-5 py-4 bg-brand-50 border-b border-brand/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                    <User size={18} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-2">
              <DrawerLink
                href="/profile"
                icon={<User size={17} />}
                label="Profil Saya"
                onClick={closeMobile}
              />
              <DrawerLink
                href="/products"
                icon={<Package size={17} />}
                label="Semua Produk"
                onClick={closeMobile}
              />
              {user ? (
                <>
                  <DrawerLink
                    href="/orders"
                    icon={<ShoppingCart size={17} />}
                    label="Pesanan Saya"
                    onClick={closeMobile}
                  />
                  <DrawerLink
                    href="/wishlist"
                    icon={<Heart size={17} />}
                    label="Wishlist"
                    onClick={closeMobile}
                  />
                  {user.role === "BUYER" && (
                    <DrawerLink
                      href="/open-store"
                      icon={<Store size={17} />}
                      label="Buka Toko"
                      onClick={closeMobile}
                    />
                  )}
                  {user.role === "SELLER" && (
                    <DrawerLink
                      href="/dashboard"
                      icon={<LayoutDashboard size={17} />}
                      label="Dashboard"
                      onClick={closeMobile}
                    />
                  )}
                  {user.role === "ADMIN" && (
                    <DrawerLink
                      href="/admin"
                      icon={<ShieldCheck size={17} />}
                      label="Admin Panel"
                      onClick={closeMobile}
                    />
                  )}
                </>
              ) : (
                <DrawerLink
                  href="/login"
                  icon={<User size={17} />}
                  label="Masuk"
                  onClick={closeMobile}
                />
              )}
            </div>

            {user && (
              <div className="px-4 py-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function NavIconBtn({
  href,
  label,
  badge,
  children,
  className = "",
}: {
  href: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-gray-600 hover:text-brand hover:bg-brand-50 transition-colors ${className}`}
    >
      <div className="relative">
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium hidden sm:block">{label}</span>
    </Link>
  );
}

function UserMenuItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
    >
      <span className="text-gray-400">{icon}</span> {label}
    </Link>
  );
}

function DrawerLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
    >
      <span className="text-gray-400">{icon}</span> {label}
    </Link>
  );
}
