import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">Halaman yang kamu cari tidak ditemukan.</p>
      <Link href="/" className="text-brand hover:underline text-sm font-medium">
        Kembali ke beranda
      </Link>
    </div>
  );
}
