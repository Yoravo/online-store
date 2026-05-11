import { logError } from "@/src/lib/logger";
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

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug) || slug.length > 50) {
      return NextResponse.json(
        {
          message:
            "Slug hanya boleh huruf kecil, angka, dan strip. Maks 50 karakter.",
        },
        { status: 400 },
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { message: "Deskripsi toko maksimal 500 karakter" },
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
    logError("[STORE POST ERROR]", error);
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
    logError("[STORE GET ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
