import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";
import { snap } from "@/src/lib/midtrans";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { addressId, cartItemIds } = await req.json();

    if (!addressId || !cartItemIds?.length) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // Ambil user
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user)
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );

    // Ambil alamat
    const address = await prisma.address.findFirst({
      where: { id: addressId, user_id: authUser.id },
    });
    if (!address)
      return NextResponse.json(
        { message: "Alamat tidak ditemukan" },
        { status: 404 },
      );

    // Ambil cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { id: { in: cartItemIds } },
      include: {
        variant: {
          include: {
            product: {
              include: { store: true },
            },
          },
        },
      },
    });

    if (!cartItems.length)
      return NextResponse.json({ message: "Cart kosong" }, { status: 400 });

    // Cek stok
    for (const item of cartItems) {
      if (item.variant.stock < item.quantity) {
        return NextResponse.json(
          {
            message: `Stok ${item.variant.product.name} tidak mencukupi`,
          },
          { status: 400 },
        );
      }
    }

    // Kelompokkan per toko
    const itemsByStore = cartItems.reduce(
      (acc, item) => {
        const storeId = item.variant.product.store_id;
        if (!acc[storeId]) acc[storeId] = [];
        acc[storeId].push(item);
        return acc;
      },
      {} as Record<string, typeof cartItems>,
    );

    // Buat order per toko
    const orders = [];
    for (const [storeId, items] of Object.entries(itemsByStore)) {
      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity,
        0,
      );
      const shipping_cost = 15000; // flat rate untuk sekarang
      const total = subtotal + shipping_cost;

      const order = await prisma.order.create({
        data: {
          user_id: authUser.id,
          store_id: storeId,
          address_id: addressId,
          status: "WAITING_PAYMENT",
          subtotal,
          shipping_cost,
          total,
          items: {
            create: items.map((item) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
        },
      });
      orders.push({ order, items });
    }

    // Total semua order
    const grandTotal = orders.reduce(
      (sum, { order }) => sum + Number(order.total),
      0,
    );

    // Buat transaksi Midtrans
    const orderId = `TOKOKU-${Date.now()}`;

    const itemDetails = cartItems.map((item) => ({
      id: item.variant_id,
      name: `${item.variant.product.name} - ${item.variant.name}`.slice(0, 50),
      price: Number(item.variant.price),
      quantity: item.quantity,
    }));

    // Tambah ongkir per toko
    Object.keys(itemsByStore).forEach((_, i) => {
      itemDetails.push({
        id: `shipping-${i}`,
        name: "Ongkos Kirim",
        price: 15000,
        quantity: 1,
      });
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: grandTotal,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: itemDetails,
    } as Parameters<typeof snap.createTransaction>[0]);

    // Simpan midtrans token ke semua order
    for (const { order } of orders) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          midtrans_token: transaction.token,
          midtrans_url: transaction.redirect_url,
          midtrans_order_id: orderId,
        },
      });
    }

    // Hapus cart items yang sudah di-checkout
    await prisma.cartItem.deleteMany({
      where: { id: { in: cartItemIds } },
    });

    // Dispatch cart update
    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orders: orders.map(({ order }) => order.id),
    });
  } catch (error) {
    console.error("[PAYMENT ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
