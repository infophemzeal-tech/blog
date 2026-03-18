import Navbar from "@/components/Navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | GistPadi",
  description: "User agreement and terms of use for GistPadi.com",
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
            Effective Date: March 18, 2026
          </p>
        </header>

        <div className="text-stone-700 dark:text-stone-300 leading-relaxed space-y-10 text-[15px]">
          
          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing GistPadi.com, you agree to be bound by these Terms of Service. If you do not agree 
              with any part of these terms, you may not use our platform.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">2. Your Content</h2>
            <p>
              <span className="font-bold text-stone-900 dark:text-white">You own the rights to the content you create and post on GistPadi.</span> 
              By posting, you grant GistPadi a non-exclusive, royalty-free license to display your content to users 
              of the platform. You are responsible for the legality and accuracy of your stories.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">3. Prohibited Conduct</h2>
            <p>While we encourage diverse gists, we do not allow:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Hate speech or harassment of any kind.</li>
              <li>Spamming, automated scraping, or bulk commercial posting.</li>
              <li>Infringement of intellectual property (copyrighted material without permission).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">4. Account Termination</h2>
            <p>
              GistPadi reserves the right to suspend or terminate accounts that violate our guidelines 
              or for any behavior that harms the health of the community.
            </p>
          </section>

          <section className="bg-stone-50 dark:bg-stone-900 p-6 rounded-xl text-stone-500 text-sm">
            <p>
              GistPadi is provided "as is." We do not guarantee that the service will always be available 
              or free from bugs. Use of the platform is at your own risk.
            </p>
          </section>

        </div>

        <footer className="mt-20 pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-400 font-sans uppercase tracking-widest">
            © 2026 GistPadi.com • Lagos, Nigeria
          </p>
        </footer>
      </article>
    </main>
  )
}