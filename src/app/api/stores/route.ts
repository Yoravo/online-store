import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

// POST - request for creating store
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, slug, description } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Nama dan slug wajib diisi" },
        { status: 400 },
      );
    }

    // check existing store
    const existingStore = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });

    if (existingStore) {
      if (existingStore.status === "PENDING") {
        return NextResponse.json(
          {
            message:
              "Kamu sudah mengajukan toko dan sedang menunggu persetujuan admin",
          },
          { status: 409 },
        );
      }
      if (existingStore.status === "ACTIVE") {
        return NextResponse.json(
          { message: "Kamu sudah memiliki toko yang aktif" },
          { status: 409 },
        );
      }
      if (existingStore.status === "SUSPENDED") {
        return NextResponse.json(
          {
            message:
              "Toko kamu sedang disuspend, hubungi admin untuk informasi lebih lanjut",
          },
          { status: 409 },
        );
      }
    }

    // Checking slug
    const slugTaken = await prisma.store.findUnique({ where: { slug } });
    if (slugTaken) {
      return NextResponse.json(
        { message: "Slug sudah digunakan, coba yang lain" },
        { status: 409 },
      );
    }

    // create store
    const store = await prisma.store.create({
      data: {
        user_id: authUser.id,
        name,
        slug,
        description,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Pengajuan toko berhasil dikirim, tunggu persetujuan admin",
        store,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[STORE POST ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// GET - request for getting store
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const store = await prisma.store.findUnique({
      where: { user_id: authUser.id },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("[STORE POST ERROR]", JSON.stringify(error, null, 2));
    console.error("[STORE POST ERROR RAW]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
