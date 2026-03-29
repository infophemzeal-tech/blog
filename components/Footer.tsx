import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Nairaly
              </span>
            </Link>

            <p className="text-stone-600 dark:text-stone-400 text-[15px] leading-relaxed max-w-xs">
              A community of curious readers and writers sharing stories,
              insights, and perspectives from Nigeria and beyond.
            </p>

            <address className="not-italic flex items-center gap-1.5 text-xs text-stone-500">
              Made with ❤️ in Lagos, Nigeria {/* ✅ semantic address tag */}
            </address>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-4 text-sm tracking-widest uppercase">
              Explore
            </h3>
            <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
  <li><Link href="/about"   className="hover:text-green-600 dark:hover:text-green-400 transition-colors">About Us</Link></li>
  <li><Link href="/write"   className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Write for Us</Link></li>
  <li><Link href="/authors" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Our Writers</Link></li>
  <li><Link href="/contact" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Contact</Link></li>
</ul>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-4 text-sm tracking-widest uppercase">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <li><Link href="/about"   className="hover:text-green-600 dark:hover:text-green-400 transition-colors">About Us</Link></li>
              <li><Link href="/write"   className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Write for Us</Link></li>
              <li><Link href="/authors" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Our Writers</Link></li>
              <li><Link href="/contact" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-4 text-sm tracking-widest uppercase">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
              <li><Link href="/privacy" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms"   className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Cookie Policy</Link></li>
            </ul>
           
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          {/* ✅ consolidated copyright + tagline */}
          <p>© {currentYear} Nairaly · Built for curious minds · Lagos, Nigeria</p>

          <div className="flex items-center gap-6">
            <Link
              href="https://twitter.com/nairaly"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nairaly on Twitter (opens in new tab)" // ✅ aria-label added
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Twitter
            </Link>
            <Link
              href="https://instagram.com/nairaly"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nairaly on Instagram (opens in new tab)" // ✅ aria-label added
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="/sitemap.xml"
              aria-label="XML Sitemap"
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}