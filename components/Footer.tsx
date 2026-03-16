import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <span className="font-serif italic text-2xl font-bold text-stone-900 dark:text-white">
            GistPadi
          </span>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            <Link href="/" className="hover:text-stone-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/search" className="hover:text-stone-900 dark:hover:text-white transition-colors">
              Search
            </Link>
            <Link href="/auth/signin" className="hover:text-stone-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/auth/signup" className="hover:text-stone-900 dark:hover:text-white transition-colors">
              Sign up
            </Link>
            <Link href="/dashboard/write" className="hover:text-stone-900 dark:hover:text-white transition-colors">
              Write
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-100 dark:border-stone-800 my-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 dark:text-stone-500">
          <p>© {new Date().getFullYear()} GistPadi. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              Terms
            </Link>
            <a href="mailto:support@gistpadi.com" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              Support
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}