import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://tokoku.example.com",
  ),
  title: {
    default: "TokoKu - Marketplace Indonesia",
    template: "%s | TokoKu",
  },
  description:
    "Temukan produk lokal berkualitas dari seller terpercaya di seluruh Indonesia.",
  keywords: [
    "marketplace indonesia",
    "toko online",
    "belanja online",
    "produk lokal",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "TokoKu",
    title: "TokoKu - Marketplace Indonesia",
    description:
      "Temukan produk lokal berkualitas dari seller terpercaya di seluruh Indonesia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TokoKu - Marketplace Indonesia",
    description:
      "Temukan produk lokal berkualitas dari seller terpercaya di seluruh Indonesia.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakartaSans.variable} ${inter.variable}`}>
      <body className="antialiased bg-background text-text selection:bg-brand selection:text-white">
        {children}
      </body>
    </html>
  );
}
