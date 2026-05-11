import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
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
    } = body;

    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: authUser.id },
        data: { is_default: false },
      });
    }

    const data: Record<string, unknown> = {};
    if (label !== undefined) data.label = label;
    if (recipient !== undefined) data.recipient = recipient;
    if (phone !== undefined) data.phone = phone;
    if (province !== undefined) data.province = province;
    if (city !== undefined) data.city = city;
    if (district !== undefined) data.district = district;
    if (postal_code !== undefined) data.postal_code = postal_code;
    if (full_address !== undefined) data.full_address = full_address;
    if (is_default !== undefined) data.is_default = is_default;

    const address = await prisma.address.updateMany({
      where: { id, user_id: authUser.id },
      data,
    });

    return NextResponse.json({ address });
  } catch (error) {
    logError("[ADDRESS PATCH ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await prisma.address.deleteMany({
      where: { id, user_id: authUser.id },
    });

    return NextResponse.json({ message: "Alamat dihapus" });
  } catch (error) {
    logError("[ADDRESS DELETE ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
