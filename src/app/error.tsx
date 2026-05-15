"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-bold">Ada yang salah</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        Terjadi kesalahan saat memuat halaman. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
      >
        Coba Lagi
      </button>
    </div>
  );
}
