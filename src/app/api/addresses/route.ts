import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// GET
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const adresses = await prisma.address.findMany({
      where: { user_id: authUser.id },
      orderBy: [{ is_default: "desc" }, { id: "asc" }],
    });

    return NextResponse.json({ adresses });
  } catch (error) {
    console.error("[ADDRESSES GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST - add new address
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const {
      label,
      recipient,
      phone,
      province,
      city,
      district,
      postal_code,
      full_address,
      is_default,
    } = await req.json();

    if (
      !label ||
      !recipient ||
      !phone ||
      !province ||
      !city ||
      !district ||
      !postal_code ||
      !full_address
    ) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    // reset default address if is_default is true
    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: authUser.id },
        data: { is_default: false },
      });
    }

    const count = await prisma.address.count({
      where: { user_id: authUser.id },
    });

    const address = await prisma.address.create({
      data: {
        user_id: authUser.id,
        label,
        recipient,
        phone,
        province,
        city,
        district,
        postal_code,
        full_address,
        is_default: is_default || count === 0,
      },
    });

    return NextResponse.json(
      { message: "Alamat berhasil ditambahkan", address },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ADDRESS POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
