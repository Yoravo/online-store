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
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch cart
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
    window.addEventListener("cart:updated", fetchCartCount);
    return () => window.removeEventListener("cart:updated", fetchCartCount);
  }, [user]);

  // Fetch notifications
  const fetchNotifications = useCallback(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      });
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Tutup notif dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock scroll saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  const handleOpenNotif = () => {
    setShowNotif((prev) => !prev);
    if (unreadCount > 0) {
      fetch("/api/notifications", { method: "PATCH" }).then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      });
    }
  };

  const closeMobileMenu = () => setShowMobileMenu(false);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b-2 border-sand bg-cream/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-xl font-bold text-ink tracking-tight"
              onClick={closeMobileMenu}
            >
              TokoKu
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/products"
                className="text-sm text-ink-light hover:text-ink transition-colors"
              >
                Produk
              </Link>
              {user?.role === "BUYER" && (
                <Link
                  href="/open-store"
                  className="text-sm text-ink-light hover:text-ink transition-colors"
                >
                  Buka Toko
                </Link>
              )}
              {user?.role === "SELLER" && (
                <Link
                  href="/dashboard"
                  className="text-sm text-ink-light hover:text-ink transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-ink-light hover:text-ink transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {loading ? (
                <div className="w-16 h-8 bg-cream-dark rounded-lg animate-pulse" />
              ) : user ? (
                <>
                  {/* Wishlist — hidden di mobile (ada di mobile menu) */}
                  <Link
                    href="/wishlist"
                    className="hidden sm:block text-ink-light hover:text-ink transition-colors p-1"
                  >
                    <Heart size={20} />
                  </Link>

                  {/* Cart */}
                  <Link
                    href="/cart"
                    className="relative text-ink-light hover:text-ink transition-colors p-1"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-cream">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Bell Notifikasi */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={handleOpenNotif}
                      className="relative text-ink-light hover:text-ink transition-colors p-1"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-cream">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notif Dropdown */}
                    {showNotif && (
                      <div className="absolute right-0 top-10 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-cream border-2 border-ink rounded-2xl shadow-brutal z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-sand">
                          <span className="text-sm font-semibold text-ink">
                            Notifikasi
                          </span>
                          <button
                            onClick={() => setShowNotif(false)}
                            className="text-ink-light hover:text-ink transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-10 text-center">
                              <Bell
                                size={28}
                                className="mx-auto text-sand mb-2"
                              />
                              <p className="text-xs text-ink-light">
                                Belum ada notifikasi
                              </p>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className={`px-4 py-3 border-b border-sand last:border-0 ${!notif.is_read ? "bg-terracotta/5" : ""}`}
                              >
                                <div className="flex items-start gap-2">
                                  {!notif.is_read && (
                                    <span className="w-2 h-2 bg-terracotta rounded-full mt-1.5 shrink-0" />
                                  )}
                                  <div className={!notif.is_read ? "" : "ml-4"}>
                                    <p className="text-xs font-semibold text-ink leading-snug">
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-ink-light mt-0.5 leading-relaxed">
                                      {notif.message}
                                    </p>
                                    <p className="text-[10px] text-sand mt-1">
                                      {timeAgo(notif.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="px-4 py-2.5 border-t-2 border-sand">
                            <Link
                              href="/orders"
                              onClick={() => setShowNotif(false)}
                              className="text-xs text-terracotta hover:text-terracotta-dark font-medium transition-colors"
                            >
                              Lihat semua pesanan →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Username — desktop only */}
                  <span className="text-sm text-ink-light hidden lg:block">
                    Hi, {user.name.split(" ")[0]}
                  </span>

                  {/* Logout — desktop only */}
                  <button
                    onClick={logout}
                    className="hidden sm:flex p-2 rounded-xl border-2 border-sand text-ink-light hover:border-red-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>

                  {/* Hamburger — mobile only */}
                  <button
                    onClick={() => setShowMobileMenu((p) => !p)}
                    className="sm:hidden p-1.5 rounded-xl border-2 border-sand text-ink-light hover:border-ink transition-colors"
                  >
                    {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-ink-light hover:text-ink transition-colors hidden sm:block"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm px-4 py-2 rounded-xl bg-ink text-cream border-2 border-ink hover:bg-ink/90 transition-colors"
                  >
                    Daftar
                  </Link>
                  {/* Hamburger untuk guest di mobile */}
                  <button
                    onClick={() => setShowMobileMenu((p) => !p)}
                    className="sm:hidden p-1.5 rounded-xl border-2 border-sand text-ink-light hover:border-ink transition-colors"
                  >
                    {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE MENU DRAWER ===== */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm sm:hidden"
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-72 z-50 bg-cream border-l-2 border-ink shadow-brutal sm:hidden flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-sand">
              <span className="font-display font-bold text-ink">Menu</span>
              <button
                onClick={closeMobileMenu}
                className="text-ink-light hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="px-5 py-4 border-b-2 border-sand bg-cream-dark">
                <p className="text-xs text-ink-light">Halo,</p>
                <p className="font-semibold text-ink">{user.name}</p>
                <p className="text-xs text-ink-light mt-0.5">{user.role}</p>
              </div>
            )}

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-3">
              <MobileNavLink
                href="/products"
                icon={<Package size={17} />}
                label="Produk"
                onClick={closeMobileMenu}
              />

              {user ? (
                <>
                  <MobileNavLink
                    href="/wishlist"
                    icon={<Heart size={17} />}
                    label="Wishlist"
                    onClick={closeMobileMenu}
                  />
                  <MobileNavLink
                    href="/orders"
                    icon={<ShoppingCart size={17} />}
                    label="Pesanan Saya"
                    onClick={closeMobileMenu}
                  />
                  {user.role === "BUYER" && (
                    <MobileNavLink
                      href="/open-store"
                      icon={<Store size={17} />}
                      label="Buka Toko"
                      onClick={closeMobileMenu}
                    />
                  )}
                  {user.role === "SELLER" && (
                    <MobileNavLink
                      href="/dashboard"
                      icon={<LayoutDashboard size={17} />}
                      label="Dashboard"
                      onClick={closeMobileMenu}
                    />
                  )}
                  {user.role === "ADMIN" && (
                    <MobileNavLink
                      href="/admin"
                      icon={<ShieldCheck size={17} />}
                      label="Admin Panel"
                      onClick={closeMobileMenu}
                    />
                  )}
                </>
              ) : (
                <MobileNavLink
                  href="/login"
                  icon={<LogOut size={17} />}
                  label="Masuk"
                  onClick={closeMobileMenu}
                />
              )}
            </div>

            {/* Logout */}
            {user && (
              <div className="px-5 py-4 border-t-2 border-sand">
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-sand text-red-400 hover:border-red-400 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut size={17} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function MobileNavLink({
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
      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-ink hover:bg-cream-dark transition-colors"
    >
      <span className="text-ink-light">{icon}</span>
      {label}
    </Link>
  );
}
