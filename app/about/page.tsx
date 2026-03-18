import Navbar from "@/components/Navbar"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About | GistPadi",
  description: "Learn more about GistPadi, the platform where the best stories and gists find you.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">
      <Navbar />

      <article className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-16 text-center">
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-stone-900 dark:text-white mb-6">
            Where good gists find you.
          </h1>
          <p className="font-serif text-xl sm:text-2xl text-stone-500 dark:text-stone-400 italic">
            GistPadi is an open platform where readers find insightful thinking, and where creators and hobbyists share their unique perspectives.
          </p>
        </header>

        <div className="font-sans text-stone-700 dark:text-stone-300 leading-relaxed space-y-8 text-lg">
          <p>
            The world is full of "gists"—stories, news, and deep insights that often get lost in the noise of traditional social media. 
            At <span className="font-bold text-stone-900 dark:text-white">GistPadi</span>, we believe that the best ideas don't come from algorithms, 
            but from people.
          </p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white pt-4">Our Mission</h2>
          <p>
            To build a digital space that values quality over quantity. Whether you’re sharing tech insights, cultural reviews, 
            or personal stories, GistPadi provides a clean, focused environment for your voice to be heard without distractions.
          </p>

          <div className="bg-stone-50 dark:bg-stone-900 p-8 rounded-2xl border border-stone-100 dark:border-stone-800 my-12">
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white mb-3">Community First</h3>
            <p className="text-base text-stone-600 dark:text-stone-400">
              GistPadi isn't just a blog; it's a growing network of thinkers. We are dedicated to maintaining 
              an ad-light, creator-friendly platform that respects your data and your attention.
            </p>
          </div>
          
          <p>
            Ready to share your story? Join thousands of writers on GistPadi and help us redefine the way 
            stories are told online.
          </p>

          <div className="pt-10 flex justify-center">
            <Link 
                href="/auth/signup" 
                className="px-8 py-3 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold hover:opacity-90 transition-all"
            >
                Start Writing
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}