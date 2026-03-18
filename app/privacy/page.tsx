import Navbar from "@/components/Navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | GistPadi",
  description: "Privacy Policy and Data Collection practices for GistPadi.com",
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
            Last Updated: March 18, 2026 • GistPadi.com
          </p>
        </header>

        {/* Content Section */}
        <div className="font-sans text-stone-700 dark:text-stone-300 leading-relaxed space-y-8 text-[15px] sm:text-[16px]">
          
          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              What Personal Data We Collect and Why
            </h2>
            <h3 className="font-bold text-stone-800 dark:text-stone-200 mt-6 mb-2">Comments</h3>
            <p>
              When visitors leave comments on GistPadi.com, we collect the information provided in the comments form, 
              along with the visitor’s IP address and browser user agent string to help detect spam. 
            </p>
            <p className="mt-4">
              An anonymized string (hash) generated from your email address may be shared with the Gravatar service 
              to check if you are using it. Once your comment is approved, your profile picture becomes visible 
              to the public alongside your comment.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Media
            </h2>
            <p>
              If you upload images to GistPadi.com, please avoid including embedded location data (EXIF GPS). 
              Visitors to the site can download and extract location data from uploaded images.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Cookies
            </h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <span className="font-bold text-stone-800 dark:text-stone-200">Comment Cookies:</span> Opt-in to saving your details 
                for convenience; these last for one year.
              </li>
              <li>
                <span className="font-bold text-stone-800 dark:text-stone-200">Login Cookies:</span> We set temporary cookies to check browser 
                compatibility and persistent cookies (2 days to 2 weeks) to manage your session.
              </li>
              <li>
                <span className="font-bold text-stone-800 dark:text-stone-200">Editor Cookies:</span> Stores the post ID of articles 
                you edit; expires after one day.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-4">
              Third-Party Advertising
            </h2>
            <p>
              GistPadi.com may use <span className="italic">DART cookies</span> through Google’s DoubleClick. 
              These cookies enable interest-based targeting based on your browsing history. 
              DART does not track personally identifiable information such as your name or financial details.
            </p>
          </section>

          <section className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white mb-3">
              Managing Cookies
            </h2>
            <p className="text-sm">
              You can disable cookies in your browser settings. However, this may affect functionality 
              on GistPadi.com, including login persistence. Unless your browser blocks cookies, 
              new ones may be added during future visits.
            </p>
          </section>

        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-400 font-sans uppercase tracking-widest">
            © 2026 GistPadi.com • All Rights Reserved
          </p>
        </footer>
      </article>
    </main>
  )
}