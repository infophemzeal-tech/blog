import Navbar from "@/components/Navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Nairaly",
  description: "User agreement and terms of use for Nairaly.com",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 font-sans">
      <Navbar />
      <article className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-12 border-b border-stone-100 dark:border-stone-800 pb-10">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-stone-500 text-sm tracking-wide">
            Effective Date: March 2026 • Nairaly.com
          </p>
        </header>

        <div className="text-stone-700 dark:text-stone-300 leading-relaxed space-y-10 text-[15px]">

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing Nairaly.com, you agree to be bound by these Terms of Service. If you
              do not agree with any part of these terms, you may not use our platform.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              2. Your Content
            </h2>
            <p>
              <span className="font-bold text-stone-900 dark:text-white">
                You own the rights to the content you create and post on Nairaly.
              </span>{" "}
              By posting, you grant Nairaly a non-exclusive, royalty-free licence to display your
              content to users of the platform. You are responsible for the legality, originality,
              and accuracy of your stories.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              3. Prohibited Conduct
            </h2>
            <p>While we encourage diverse voices and perspectives, we do not allow:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Hate speech, discrimination, or harassment of any kind.</li>
              <li>Spamming, automated scraping, or bulk commercial posting.</li>
              <li>Infringement of intellectual property or copyrighted material without permission.</li>
              <li>Posting false, misleading, or deliberately harmful information.</li>
              <li>Impersonating other individuals, brands, or organisations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              4. Account Termination
            </h2>
            <p>
              Nairaly reserves the right to suspend or permanently terminate accounts that violate
              our community guidelines or engage in any behaviour that harms the platform or its
              users. We will make reasonable efforts to notify you before taking action.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              5. Intellectual Property
            </h2>
            <p>
              The Nairaly name, logo, and platform design are the intellectual property of
              Nairaly.com. You may not reproduce or use them without explicit written permission.
              Content created by writers remains the property of the respective authors.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              6. Changes to Terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of Nairaly after changes
              are published constitutes your acceptance of the updated terms. We will notify
              registered users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              7. Contact
            </h2>
            <p>
              If you have questions about these terms, please reach out to us at{" "}
              <a
                href="mailto:hello@nairaly.com"
                className="text-green-600 dark:text-green-400 underline"
              >
                hello@nairaly.com
              </a>
              .
            </p>
          </section>

          <section className="bg-stone-50 dark:bg-stone-900 p-6 rounded-xl text-stone-500 text-sm">
            <p>
              Nairaly is provided "as is." We do not guarantee that the service will always be
              available or free from errors. Use of the platform is at your own risk. We are not
              liable for any loss or damage arising from your use of the platform.
            </p>
          </section>

        </div>

        <footer className="mt-20 pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-400 font-sans uppercase tracking-widest">
            © 2026 Nairaly.com • Lagos, Nigeria
          </p>
        </footer>
      </article>
    </main>
  )
}