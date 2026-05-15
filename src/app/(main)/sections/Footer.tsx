import Link from "next/link";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";

const SOCIALS = [
  { Icon: FaInstagram, href: "https://instagram.com/tokoku", label: "Instagram" },
  { Icon: FaTwitter, href: "https://twitter.com/tokoku", label: "Twitter" },
  { Icon: FaFacebook, href: "https://facebook.com/tokoku", label: "Facebook" },
];

const LINKS = [
  {
    title: "Belanja",
    links: [
      { label: "Semua Produk", href: "/products" },
      { label: "Kategori", href: "/products" },
      { label: "Flash Sale", href: "/products" },
    ],
  },
  {
    title: "Seller",
    links: [
      { label: "Buka Toko", href: "/open-store" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "FAQ", href: "/products" },
      { label: "Kontak", href: "/products" },
      { label: "Kebijakan", href: "/products" },
      { label: "Syarat", href: "/products" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-3">TokoKu</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Marketplace modern yang menghubungkan seller dan pembeli
              terpercaya di seluruh Indonesia.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-brand transition-colors"
                >
                  <Icon size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-1">
              Untuk Seller Baru
            </p>
            <h3 className="text-lg font-bold text-white">
              Buka Toko Gratis Sekarang
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Langsung bisa jualan ke seluruh Indonesia
            </p>
          </div>
          <Link
            href="/open-store"
            className="shrink-0 px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-bold transition-colors"
          >
            Mulai Jualan →
          </Link>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} TokoKu. Crafted by{" "}
            <a
              href="https://github.com/yoravo"
              className="hover:text-white transition-colors"
            >
              Radja Ravine Salfriandry
            </a>{" "}
            with ♥
          </p>
          <div className="flex gap-5">
            {[
              { label: "Privasi", href: "/products" },
              { label: "Syarat", href: "/products" },
              { label: "Cookies", href: "/products" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
