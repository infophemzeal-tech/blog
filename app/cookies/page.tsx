import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn how Nairaly uses cookies and how to manage your preferences.",
  alternates: { canonical: "https://nairaly.com/cookies" },
}

export default function CookiesPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-16 sm:py-24">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-4">
        Cookie Policy
      </h1>
      <p className="text-stone-500 dark:text-stone-400 text-base leading-relaxed mb-8">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p>
          Nairaly uses cookies to improve your experience, analyse site traffic,
          and personalise content. By using our site you agree to our use of cookies.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website.
          They help us remember your preferences and understand how you use Nairaly.
        </p>

        <h2>Cookies we use</h2>
        <ul>
          <li><strong>Essential cookies</strong> — required for authentication and core site functionality.</li>
          <li><strong>Analytics cookies</strong> — Google Analytics helps us understand traffic patterns (can be declined).</li>
          <li><strong>Preference cookies</strong> — remembers your dark/light mode setting.</li>
        </ul>

        <h2>Managing cookies</h2>
        <p>
          You can disable cookies in your browser settings at any time. Note that
          disabling essential cookies may affect your ability to sign in.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Reach us at{" "}
          <a href="mailto:hello@nairaly.com" className="text-green-600 hover:underline">
            hello@nairaly.com
          </a>
        </p>
      </div>
    </main>
  )
}