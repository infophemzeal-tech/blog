import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found — Nairaly",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-5 text-center">

      <p className="font-mono text-xs tracking-[0.3em] uppercase text-stone-400 dark:text-stone-600 mb-6">
        404
      </p>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 dark:text-white mb-4 leading-tight">
        Page not found
      </h1>

      <p className="text-stone-500 dark:text-stone-400 text-base sm:text-lg max-w-sm mb-10 leading-relaxed">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-semibold hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-colors duration-200"
        >
          Go home
        </Link>
        <Link
          href="/about"
          className="px-5 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-700 transition-colors duration-200"
        >
          About Nairaly
        </Link>
      </div>

    </main>
  )
}