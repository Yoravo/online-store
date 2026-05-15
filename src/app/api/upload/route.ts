import { logError } from "@/src/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/src/lib/api-auth";

// Pakai service_role untuk bypass RLS — aman karena ini server-side only
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (authUser.role !== "SELLER" && authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file)
      return NextResponse.json(
        { message: "File tidak ditemukan" },
        { status: 400 },
      );

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP" },
        { status: 400 },
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Ukuran file maksimal 2MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const hex = buffer.slice(0, 4).toString("hex");
    const isValidImage =
      hex.startsWith("ffd8ff") || // JPEG
      hex.startsWith("89504e47") || // PNG
      hex.startsWith("52494646"); // RIFF (WebP)

    if (!isValidImage) {
      return NextResponse.json(
        { message: "File bukan gambar valid" },
        { status: 400 },
      );
    }

    const ext = "webp"; // Always convert to webp for best compression
    const fileName = `${authUser.id}-${Date.now()}.${ext}`;
    const filePath = `products/${fileName}`;

    // Resize & compress with sharp
    const sharp = (await import("sharp")).default;
    const optimized = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, optimized, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      logError("[UPLOAD ERROR]", error);
      return NextResponse.json(
        { message: "Gagal upload gambar" },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    logError("[UPLOAD ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
