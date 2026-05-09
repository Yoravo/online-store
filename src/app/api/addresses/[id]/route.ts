import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getAuthUser } from "@/src/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    if (body.is_default) {
      await prisma.address.updateMany({
        where: { user_id: authUser.id },
        data: { is_default: false },
      });
    }

    const address = await prisma.address.updateMany({
      where: { id, user_id: authUser.id },
      data: body,
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("[ADDRESS PATCH ERROR]", error);
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
    console.error("[ADDRESS DELETE ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
