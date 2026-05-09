"use client";

import { useEffect, useReducer } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  ShoppingBag,
  ChevronRight,
  Minus,
  Plus,
  Store,
} from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    price: number;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: { url: string }[];
      store: { id: string; name: string; slug: string };
    };
  };
}

interface CartByStore {
  store: { id: string; name: string; slug: string };
  items: CartItem[];
}

type State = { items: CartItem[]; loading: boolean; updatingId: string | null };
type Action =
  | { type: "SET_ITEMS"; items: CartItem[] }
  | { type: "SET_UPDATING"; id: string | null }
  | { type: "SET_LOADED" };

const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case "SET_ITEMS":
      return { ...s, items: a.items, loading: false };
    case "SET_UPDATING":
      return { ...s, updatingId: a.id };
    case "SET_LOADED":
      return { ...s, loading: false };
    default:
      return s;
  }
};

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function CartPage() {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    loading: true,
    updatingId: null,
  });
  const { items, loading, updatingId } = state;

  const loadCart = () =>
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        dispatch({ type: "SET_ITEMS", items: d.cart?.items || [] });
        window.dispatchEvent(new Event("cart:updated"));
      })
      .catch(() => dispatch({ type: "SET_LOADED" }));

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        dispatch({ type: "SET_ITEMS", items: d.cart?.items || [] });
        window.dispatchEvent(new Event("cart:updated"));
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "SET_LOADED" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateQty = async (itemId: string, quantity: number) => {
    dispatch({ type: "SET_UPDATING", id: itemId });
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    await loadCart();
    dispatch({ type: "SET_UPDATING", id: null });
  };

  const removeItem = async (itemId: string) => {
    dispatch({ type: "SET_UPDATING", id: itemId });
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    await loadCart();
    dispatch({ type: "SET_UPDATING", id: null });
  };

  const cartByStore: CartByStore[] = items.reduce((acc, item) => {
    const store = item.variant.product.store;
    const existing = acc.find((g) => g.store.id === store.id);
    if (existing) existing.items.push(item);
    else acc.push({ store, items: [item] });
    return acc;
  }, [] as CartByStore[]);

  const total = items.reduce(
    (acc, item) => acc + Number(item.variant.price) * item.quantity,
    0,
  );
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4 mt-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-5">
          <ShoppingBag size={36} className="text-gray-200" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Keranjang kosong
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Tambahkan produk favorit ke keranjang
        </p>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Keranjang</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {totalItems} item dari {cartByStore.length} toko
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Items */}
        <div className="flex-1 space-y-3 w-full">
          {cartByStore.map(({ store, items: storeItems }) => (
            <div
              key={store.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              {/* Store Header */}
              <Link
                href={`/stores/${store.slug}`}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <Store size={14} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">
                  {store.name}
                </span>
                <ChevronRight size={13} className="text-gray-300 ml-auto" />
              </Link>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {storeItems.map((item) => {
                  const image = item.variant.product.images[0]?.url;
                  const isUpdating = updatingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-3 p-4 transition-opacity ${isUpdating ? "opacity-40 pointer-events-none" : ""}`}
                    >
                      {/* Image */}
                      <Link
                        href={`/products/${item.variant.product.slug}`}
                        className="shrink-0"
                      >
                        <div className="w-18 h-18 rounded-xl overflow-hidden bg-gray-50 relative">
                          {image ? (
                            <Image
                              src={image}
                              alt={item.variant.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.variant.product.slug}`}>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-brand transition-colors">
                            {item.variant.product.name}
                          </p>
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.variant.name}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1.5">
                          {fmt(Number(item.variant.price))}
                        </p>

                        <div className="flex items-center justify-between mt-2.5">
                          {/* Qty */}
                          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-0.5">
                            <button
                              onClick={() =>
                                updateQty(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQty(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.variant.stock}
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Subtotal + Delete */}
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-gray-900">
                              {fmt(Number(item.variant.price) * item.quantity)}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Summary — sticky */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 lg:sticky lg:top-20">
            <h2 className="text-sm font-bold text-gray-900">
              Ringkasan Belanja
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Total ({totalItems} item)</span>
                <span className="font-medium text-gray-900">{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkos kirim</span>
                <span className="text-green-500 font-medium">
                  Dihitung saat checkout
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-900">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {fmt(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="block w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-bold text-center transition-colors"
              >
                Checkout ({totalItems} item)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
