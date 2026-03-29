"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function SignInForm() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get("next") || "/"
  const supabase     = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message.includes("Invalid login credentials")
          ? "Invalid email or password."
          : error.message
      )
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="group">
            <span className="font-serif italic text-4xl font-bold text-green-600 dark:text-white group-hover:text-green-500 transition-colors">
              Nairaly
            </span>
          </Link>
          <p className="text-stone-500 dark:text-stone-400 mt-3 text-sm font-medium">
            Welcome back to the community.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-900 dark:text-white text-sm outline-none focus:border-green-500 dark:focus:border-green-500 transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                Password
              </label>
              <Link
                href="/auth/reset"
                className="text-[11px] font-semibold text-stone-400 hover:text-green-600 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-900 dark:text-white text-sm outline-none focus:border-green-500 dark:focus:border-green-500 transition-all placeholder:text-stone-400"
            />
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-bold hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
          >
            {loading ? "Verifying..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-8">
          No account?{" "}
          <Link
            href={`/auth/signup?next=${next}`}
            className="text-stone-900 dark:text-white font-bold hover:text-green-600 dark:hover:text-green-400 transition-colors underline decoration-stone-200 dark:decoration-stone-800 underline-offset-4"
          >
            Create one for free
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function SignInClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-stone-950 flex items-center justify-center animate-pulse" />
      }
    >
      <SignInForm />
    </Suspense>
  )
}