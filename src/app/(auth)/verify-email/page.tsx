"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit saat 6 digit terisi
    if (newCode.every((d) => d) && value) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      inputsRef.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otp: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
      setMessage(data.message);
      setCooldown(60);
    } catch {
      setError("Gagal mengirim ulang kode");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <CheckCircle size={48} className="text-green-500" />
        <h1 className="text-xl font-bold text-gray-900">Email Terverifikasi!</h1>
        <p className="text-sm text-gray-500">Mengalihkan ke beranda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-brand" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verifikasi Email</h1>
          <p className="text-sm text-gray-500 mt-2">
            Masukkan kode 6 digit yang telah dikirim ke email kamu
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="w-11 h-13 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-brand focus:outline-none transition-colors disabled:opacity-50"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        {message && (
          <p className="text-sm text-green-600 text-center">{message}</p>
        )}

        {loading && (
          <p className="text-sm text-gray-400 text-center">Memverifikasi...</p>
        )}

        {/* Resend */}
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Tidak menerima kode?</p>
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-sm font-medium text-brand hover:text-brand-dark disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {cooldown > 0
              ? `Kirim ulang (${cooldown}s)`
              : resending
                ? "Mengirim..."
                : "Kirim Ulang Kode"}
          </button>
        </div>
      </div>
    </div>
  );
}
