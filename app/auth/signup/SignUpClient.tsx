"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignUpClient() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/")
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
            Join the community. Your ideas matter.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-900 dark:text-white text-sm outline-none focus:border-green-500 dark:focus:border-green-500 transition-all placeholder:text-stone-400"
            />
          </div>

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
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-8">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-stone-900 dark:text-white font-bold hover:text-green-600 dark:hover:text-green-400 transition-colors underline decoration-stone-200 dark:decoration-stone-800 underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}