import Link from "next/link"
import Image from "next/image"
import type { Article } from "../data/articles"

type ArticleCardProps = {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="group flex items-start justify-between gap-3 sm:gap-6 py-6 border-b border-stone-100 dark:border-stone-800">

      {/* Left — content */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">

        {/* Author row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
            {article.authorInitial}
          </div>
          <span className="text-sm text-stone-600 dark:text-stone-400 truncate">
            {article.author}
          </span>
          {article.publication && (
            <span className="text-sm text-stone-400 dark:text-stone-500 hidden sm:inline">
              in <span className="text-stone-600 dark:text-stone-400">{article.publication}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/article/${article.slug}`}>
          <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug hover:underline cursor-pointer">
            {article.title}
          </h2>
        </Link>

        {/* Subtitle */}
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 hidden sm:block">
          {article.subtitle}
        </p>

        {/* Bottom row */}
        <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500 mt-1 flex-wrap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>{article.date}</span>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v7.5L9 8.5c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l5.3 5.3A6 6 0 0020 11.3V6.5c0-1.1-.9-2-2-2s-2 .9-2 2"/>
              <path d="M14.5 5.5c0-1.1-.9-2-2-2"/>
            </svg>
            <span>{article.claps}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <span>{article.comments}</span>
          </div>

          {/* Always visible on mobile, hover on desktop */}
          <div className="ml-auto flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <button className="hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
                <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
              </svg>
            </button>
            <button className="hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </button>
            <button className="hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="12" r="1" fill="currentColor"/>
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="19" cy="12" r="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <Link href={`/article/${article.slug}`} className="shrink-0">
        <div className="relative w-16 h-14 sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-700 hover:opacity-80 transition-opacity">
          {article.coverImage ? (
            <Image
  src={article.coverImage}
  alt={article.title}
  fill
  sizes="(max-width: 640px) 64px, 96px"
  className="object-cover object-top"
/>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400 dark:from-stone-600 dark:to-stone-700" />
          )}
        </div>
      </Link>

    </div>
  )
}