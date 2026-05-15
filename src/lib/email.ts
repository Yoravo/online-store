export async function sendVerificationEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.log(`[DEV] Verification code for ${to}: ${code}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject: "Verifikasi Email TokoKu",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px">
          <h2 style="color:#1e293b">Verifikasi Email</h2>
          <p style="color:#64748b">Masukkan kode berikut untuk verifikasi akun TokoKu kamu:</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e293b">${code}</span>
          </div>
          <p style="color:#94a3b8;font-size:13px">Kode berlaku 10 menit. Jangan bagikan kode ini ke siapapun.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[EMAIL ERROR]", res.status, err);
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
