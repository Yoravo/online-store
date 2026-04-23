import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// GET /api/cart
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { user_id: authUser.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { is_primary: true }, take: 1 },
                    store: { select: { id: true, name: true, slug: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ cart });
  } catch (error) {
    console.error("[CART GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi Kesalahan Server" },
      { status: 500 },
    );
  }
}

// post /api/cart
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { variantId, quantity } = await req.json();

    if (!variantId || !quantity || quantity < 1) {
      return NextResponse.json(
        { message: "Data tidak valid" },
        { status: 400 },
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json(
        { message: "Variant tidak ditemukan" },
        { status: 404 },
      );
    }

    if (variant.stock < quantity) {
      return NextResponse.json(
        { message: "Stock tidak mencukupi" },
        { status: 400 },
      );
    }

    // get user cart
    const cart = await prisma.cart.findUnique({
      where: { user_id: authUser.id },
    });

    if (!cart) {
      return NextResponse.json(
        { message: "Cart tidak ditemukan" },
        { status: 404 },
      );
    }

    // check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cart_id_variant_id: {
          cart_id: cart.id,
          variant_id: variantId,
        },
      },
    });

    if (existingItem) {
      // update quantity
      const newQty = existingItem.quantity + quantity;
      if (variant.stock < newQty) {
        return NextResponse.json(
          { message: "Stock tidak mencukupi" },
          { status: 400 },
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      // make new item
      await prisma.cartItem.create({
        data: { cart_id: cart.id, variant_id: variantId, quantity },
      });
    }
    return NextResponse.json({ message: "Berhasil menambahkan ke keranjang" });
  } catch (error) {
    console.error("[CART POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PATCH — update quantity item
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { itemId, quantity } = await req.json();

    if (!itemId || quantity < 1) {
      return NextResponse.json(
        { message: "Data tidak valid" },
        { status: 400 },
      );
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: true, cart: true },
    });

    if (!item || item.cart.user_id !== authUser.id) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 },
      );
    }

    if (item.variant.stock < quantity) {
      return NextResponse.json(
        { message: "Stok tidak mencukupi" },
        { status: 400 },
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ message: "Keranjang diperbarui" });
  } catch (error) {
    console.error("[CART PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE — hapus item dari cart
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { itemId } = await req.json();

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.user_id !== authUser.id) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ message: "Item dihapus dari keranjang" });
  } catch (error) {
    console.error("[CART DELETE ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
