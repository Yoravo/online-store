"use client";

import { useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  ShoppingBag,
  Truck,
  X,
  ChevronRight,
} from "lucide-react";

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

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    price: number;
    product: { name: string; store: { name: string } };
  };
}

type State = {
  addresses: Address[];
  cartItems: CartItem[];
  selectedAddress: string;
  loading: boolean;
  processing: boolean;
  error: string;
  showAddAddress: boolean;
  addressForm: {
    label: string;
    recipient: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    full_address: string;
  };
};

type Action =
  | {
      type: "INIT";
      addresses: Address[];
      cartItems: CartItem[];
      selectedAddress: string;
    }
  | { type: "SET_ADDRESS"; id: string }
  | { type: "SET_PROCESSING"; value: boolean }
  | { type: "SET_ERROR"; msg: string }
  | { type: "TOGGLE_ADD_ADDRESS" }
  | { type: "UPDATE_FORM"; key: string; value: string }
  | { type: "ADD_ADDRESS_SUCCESS"; address: Address }
  | { type: "SET_LOADED" };

const EMPTY_FORM = {
  label: "",
  recipient: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  postal_code: "",
  full_address: "",
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "INIT":
      return {
        ...s,
        addresses: a.addresses,
        cartItems: a.cartItems,
        selectedAddress: a.selectedAddress,
        loading: false,
      };
    case "SET_LOADED":
      return { ...s, loading: false };
    case "SET_ADDRESS":
      return { ...s, selectedAddress: a.id };
    case "SET_PROCESSING":
      return { ...s, processing: a.value };
    case "SET_ERROR":
      return { ...s, error: a.msg, processing: false };
    case "TOGGLE_ADD_ADDRESS":
      return {
        ...s,
        showAddAddress: !s.showAddAddress,
        addressForm: EMPTY_FORM,
      };
    case "UPDATE_FORM":
      return { ...s, addressForm: { ...s.addressForm, [a.key]: a.value } };
    case "ADD_ADDRESS_SUCCESS":
      return {
        ...s,
        addresses: [...s.addresses, a.address],
        selectedAddress: a.address.id,
        showAddAddress: false,
        addressForm: EMPTY_FORM,
      };
    default:
      return s;
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const ADDRESS_FIELDS = [
  { name: "label", placeholder: "Label (Rumah, Kantor)", col: 2 },
  { name: "recipient", placeholder: "Nama Penerima", col: 1 },
  { name: "phone", placeholder: "No. Telepon", col: 1 },
  { name: "province", placeholder: "Provinsi", col: 1 },
  { name: "city", placeholder: "Kota/Kabupaten", col: 1 },
  { name: "district", placeholder: "Kecamatan", col: 1 },
  { name: "postal_code", placeholder: "Kode Pos", col: 1 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    addresses: [],
    cartItems: [],
    selectedAddress: "",
    loading: true,
    processing: false,
    error: "",
    showAddAddress: false,
    addressForm: EMPTY_FORM,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/addresses").then((r) => r.json()),
      fetch("/api/cart").then((r) => r.json()),
    ])
      .then(([addrData, cartData]) => {
        if (cancelled) return;
        const defaultAddr = addrData.addresses?.find(
          (a: Address) => a.is_default,
        );
        dispatch({
          type: "INIT",
          addresses: addrData.addresses || [],
          cartItems: cartData.cart?.items || [],
          selectedAddress: defaultAddr?.id || "",
        });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "SET_LOADED" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    addresses,
    cartItems,
    selectedAddress,
    loading,
    processing,
    error,
    showAddAddress,
    addressForm,
  } = state;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    const data = await res.json();
    if (res.ok)
      dispatch({ type: "ADD_ADDRESS_SUCCESS", address: data.address });
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      dispatch({ type: "SET_ERROR", msg: "Pilih alamat pengiriman dulu" });
      return;
    }
    if (!cartItems.length) {
      dispatch({ type: "SET_ERROR", msg: "Keranjang kamu kosong" });
      return;
    }
    dispatch({ type: "SET_PROCESSING", value: true });
    dispatch({ type: "SET_ERROR", msg: "" });
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          cartItemIds: cartItems.map((i) => i.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch({ type: "SET_ERROR", msg: data.message });
        return;
      }
      window.snap.pay(data.token, {
        onSuccess: () => {
          window.dispatchEvent(new Event("cart:updated"));
          router.push("/orders");
        },
        onPending: () => {
          window.dispatchEvent(new Event("cart:updated"));
          router.push("/orders");
        },
        onError: () =>
          dispatch({ type: "SET_ERROR", msg: "Pembayaran gagal, coba lagi" }),
        onClose: () => dispatch({ type: "SET_PROCESSING", value: false }),
      });
    } catch {
      dispatch({ type: "SET_ERROR", msg: "Terjadi kesalahan, coba lagi" });
    }
  };

  const subtotal = cartItems.reduce(
    (s, i) => s + Number(i.variant.price) * i.quantity,
    0,
  );
  const storeCount = new Set(cartItems.map((i) => i.variant.product.store.name))
    .size;
  const shipping = storeCount * 15000;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-7 bg-gray-100 rounded w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-gray-100 rounded-xl" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        async
      />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left — Alamat + Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Alamat */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={15} className="text-brand" /> Alamat Pengiriman
                </h2>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_ADD_ADDRESS" })}
                  className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-medium transition-colors"
                >
                  <Plus size={13} /> Tambah
                </button>
              </div>

              <div className="p-5 space-y-3">
                {addresses.length === 0 && !showAddAddress && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Belum ada alamat — tambahkan dulu
                  </p>
                )}

                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress === addr.id
                        ? "border-brand bg-brand-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() =>
                        dispatch({ type: "SET_ADDRESS", id: addr.id })
                      }
                      className="mt-0.5 accent-brand"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-md font-semibold">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {addr.recipient} · {addr.phone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {addr.full_address}, {addr.district}, {addr.city},{" "}
                        {addr.province} {addr.postal_code}
                      </p>
                    </div>
                  </label>
                ))}

                {/* Form tambah alamat */}
                {showAddAddress && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        Alamat Baru
                      </p>
                      <button
                        onClick={() => dispatch({ type: "TOGGLE_ADD_ADDRESS" })}
                      >
                        <X size={15} className="text-gray-400" />
                      </button>
                    </div>
                    <form onSubmit={handleAddAddress} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {ADDRESS_FIELDS.map((field) => (
                          <input
                            key={field.name}
                            type="text"
                            placeholder={field.placeholder}
                            value={
                              addressForm[
                                field.name as keyof typeof addressForm
                              ]
                            }
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_FORM",
                                key: field.name,
                                value: e.target.value,
                              })
                            }
                            required
                            className={`px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand transition-colors ${field.col === 2 ? "col-span-2" : ""}`}
                          />
                        ))}
                      </div>
                      <textarea
                        placeholder="Alamat lengkap"
                        value={addressForm.full_address}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_FORM",
                            key: "full_address",
                            value: e.target.value,
                          })
                        }
                        required
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch({ type: "TOGGLE_ADD_ADDRESS" })
                          }
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <ShoppingBag size={15} className="text-brand" />
                <h2 className="text-sm font-bold text-gray-900">
                  Produk ({cartItems.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.variant.product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.variant.name} × {item.quantity} ·{" "}
                        {item.variant.product.store.name}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0 ml-4">
                      {fmt(Number(item.variant.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Summary sticky */}
          <div className="lg:sticky lg:top-20">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-900">
                Ringkasan Pembayaran
              </h2>

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {fmt(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Truck size={12} /> Ongkos kirim
                  </span>
                  <span className="font-medium text-gray-900">
                    {fmt(shipping)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {fmt(total)}
                  </span>
                </div>

                {error && (
                  <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={processing || !selectedAddress || !cartItems.length}
                  className="w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                      Memproses...
                    </>
                  ) : (
                    <>
                      {`Bayar ${fmt(total)}`} <ChevronRight size={15} />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 text-center mt-3">
                  🔒 Pembayaran aman via Midtrans
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
