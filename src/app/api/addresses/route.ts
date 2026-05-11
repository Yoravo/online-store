import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// GET
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const addresses = await prisma.address.findMany({
      where: { user_id: authUser.id },
      orderBy: [{ is_default: "desc" }, { id: "asc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    logError("[ADDRESSES GET ERROR]", error);
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

    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: "Format nomor telepon tidak valid" },
        { status: 400 },
      );
    }

    if (!/^\d{5}$/.test(postal_code)) {
      return NextResponse.json(
        { message: "Kode pos harus 5 digit angka" },
        { status: 400 },
      );
    }

    // reset default address if is_default is true
    const count = await prisma.address.count({
      where: { user_id: authUser.id },
    });

    const address = await prisma.$transaction(async (tx) => {
      if (is_default || count === 0) {
        await tx.address.updateMany({
          where: { user_id: authUser.id },
          data: { is_default: false },
        });
      }

      return tx.address.create({
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
    });

    return NextResponse.json(
      { message: "Alamat berhasil ditambahkan", address },
      { status: 201 },
    );
  } catch (error) {
    logError("[ADDRESS POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
