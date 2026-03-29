import Navbar from "@/components/Navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Nairaly",
  description: "Privacy Policy and Data Collection practices for Nairaly.com",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">
      <Navbar />

      <article className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        {/* Header */}
        <header className="mb-12 border-b border-stone-100 dark:border-stone-800 pb-10">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-sans text-sm tracking-wide">
            Last Updated: March 2026 • Nairaly.com
          </p>
        </header>

        {/* Content Section */}
        <div className="font-sans text-stone-700 dark:text-stone-300 leading-relaxed space-y-8 text-[15px] sm:text-[16px]">

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              What Personal Data We Collect and Why
            </h2>
            <h3 className="font-bold text-stone-800 dark:text-stone-200 mt-6 mb-2">
              Account Information
            </h3>
            <p>
              When you create an account on Nairaly, we collect your name, email address, and
              profile information you choose to provide. This information is used to personalise
              your experience and identify you as a writer or reader on the platform.
            </p>

            <h3 className="font-bold text-stone-800 dark:text-stone-200 mt-6 mb-2">
              Comments & Interactions
            </h3>
            <p>
              When you leave comments or interact with articles on Nairaly.com, we collect the
              content you submit along with your IP address and browser information to help
              detect spam and abuse.
            </p>

            <h3 className="font-bold text-stone-800 dark:text-stone-200 mt-6 mb-2">
              Usage Data
            </h3>
            <p>
              We collect anonymised data about how you use the platform — such as articles read,
              topics followed, and time spent — to improve content recommendations and the overall
              experience.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Media
            </h2>
            <p>
              If you upload images to Nairaly.com as a writer, please avoid including embedded
              location data (EXIF GPS). Visitors to the site may be able to download and extract
              location data from uploaded images.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Cookies
            </h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Authentication Cookies:
                </span>{" "}
                Used to keep you logged in securely. These persist for up to 2 weeks depending
                on your session settings.
              </li>
              <li>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Preference Cookies:
                </span>{" "}
                Store your settings such as dark mode and topic preferences so they are
                remembered between visits.
              </li>
              <li>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Analytics Cookies:
                </span>{" "}
                Help us understand how visitors use the platform so we can improve it.
                All data collected is anonymised.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Third-Party Services
            </h2>
            <p>
              Nairaly uses Supabase for secure data storage and authentication. We do not sell
              your personal data to third parties. Any third-party services we use are bound by
              their own privacy policies and are selected for their commitment to data security.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal data at any time
              through your account settings. If you wish to permanently delete your account and
              all associated data, please contact us at{" "}
              <a
                href="mailto:hello@nairaly.com"
                className="text-green-600 dark:text-green-400 underline"
              >
                hello@nairaly.com
              </a>
              .
            </p>
          </section>

          <section className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white mb-3">
              Managing Cookies
            </h2>
            <p className="text-sm">
              You can disable cookies in your browser settings at any time. However, doing so
              may affect certain functionality on Nairaly.com, including staying logged in.
              Unless your browser blocks cookies, new ones may be set during future visits.
            </p>
          </section>

        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-400 font-sans uppercase tracking-widest">
            © 2026 Nairaly.com • All Rights Reserved
          </p>
        </footer>
      </article>
    </main>
  )
}