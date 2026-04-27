"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, ShoppingBag, Truck } from "lucide-react";

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
    product: {
      name: string;
      store: { name: string };
    };
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    postal_code: "",
    full_address: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/addresses").then((r) => r.json()),
      fetch("/api/cart").then((r) => r.json()),
    ])
      .then(([addrData, cartData]) => {
        setAddresses(addrData.addresses || []);
        setCartItems(cartData.cart?.items || []);
        const defaultAddr = addrData.addresses?.find(
          (a: Address) => a.is_default,
        );
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    const data = await res.json();
    if (res.ok) {
      setAddresses((prev) => [...prev, data.address]);
      setSelectedAddress(data.address.id);
      setShowAddAddress(false);
      setAddressForm({
        label: "",
        recipient: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        postal_code: "",
        full_address: "",
      });
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError("Pilih alamat pengiriman dulu");
      return;
    }
    if (!cartItems.length) {
      setError("Cart kamu kosong");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          cartItemIds: cartItems.map((item) => item.id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      // Load Midtrans Snap
      window.snap.pay(data.token, {
        onSuccess: () => {
          window.dispatchEvent(new Event("cart:updated"));
          router.push("/orders");
        },
        onPending: () => {
          window.dispatchEvent(new Event("cart:updated"));
          router.push("/orders");
        },
        onError: () => {
          setError("Pembayaran gagal, coba lagi");
          setProcessing(false);
        },
        onClose: () => {
          setProcessing(false);
        },
      });
    } catch {
      setError("Terjadi kesalahan, coba lagi");
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );
  const shippingPerStore =
    new Set(cartItems.map((item) => item.variant.product.store.name)).size *
    15000;
  const total = subtotal + shippingPerStore;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      {/* Load Midtrans Snap */}
      <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        async
      />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>

        {/* Alamat */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={16} /> Alamat Pengiriman
            </h2>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <Plus size={14} /> Tambah Alamat
            </button>
          </div>

          {addresses.length === 0 && !showAddAddress && (
            <p className="text-sm text-gray-400">
              Belum ada alamat. Tambahkan alamat dulu.
            </p>
          )}

          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedAddress === addr.id
                    ? "border-black bg-gray-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={() => setSelectedAddress(addr.id)}
                  className="mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {addr.label}
                    </span>
                    {addr.is_default && (
                      <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-md">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {addr.recipient} • {addr.phone}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {addr.full_address}, {addr.district}, {addr.city},{" "}
                    {addr.province} {addr.postal_code}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Form tambah alamat */}
          {showAddAddress && (
            <form
              onSubmit={handleAddAddress}
              className="space-y-3 pt-4 border-t border-gray-100"
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    name: "label",
                    placeholder: "Label (Rumah, Kantor)",
                    col: 2,
                  },
                  { name: "recipient", placeholder: "Nama Penerima", col: 1 },
                  { name: "phone", placeholder: "No. Telepon", col: 1 },
                  { name: "province", placeholder: "Provinsi", col: 1 },
                  { name: "city", placeholder: "Kota/Kabupaten", col: 1 },
                  { name: "district", placeholder: "Kecamatan", col: 1 },
                  { name: "postal_code", placeholder: "Kode Pos", col: 1 },
                ].map((field) => (
                  <input
                    key={field.name}
                    type="text"
                    placeholder={field.placeholder}
                    value={addressForm[field.name as keyof typeof addressForm]}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    required
                    className={`px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black ${field.col === 2 ? "col-span-2" : ""}`}
                  />
                ))}
              </div>
              <textarea
                placeholder="Alamat lengkap"
                value={addressForm.full_address}
                onChange={(e) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    full_address: e.target.value,
                  }))
                }
                required
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Simpan Alamat
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={16} /> Ringkasan Pesanan
          </h2>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">
                    {item.variant.product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.variant.name} × {item.quantity} •{" "}
                    {item.variant.product.store.name}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(Number(item.variant.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Truck size={13} /> Ongkir (flat)
              </span>
              <span>{formatPrice(shippingPerStore)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={processing || !selectedAddress || !cartItems.length}
          className="w-full py-4 bg-black text-white rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {processing ? "Memproses..." : `Bayar ${formatPrice(total)}`}
        </button>
      </div>
    </>
  );
}
