"use client"

import { useState } from "react"

type Props = {
  title: string
  slug: string
}

export default function ShareButtons({ title, slug }: Props) {
  const[copied, setCopied] = useState(false)

  // Safely grab the current URL without causing hydration mismatches
  const getArticleUrl = () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
    return `${siteUrl}/article/${slug}`
  }

  const handleCopyLink = async () => {
    const url = getArticleUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Legacy fallback for older browsers
      const input = document.createElement("input")
      input.value = url
      input.style.position = "fixed" // Prevent aggressive scroll jumping
      input.style.opacity = "0"
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSocialShare = (platformUrlTemplate: string) => {
    const url = getArticleUrl()
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    
    // Inject the exact url and title dynamically when clicked
    const finalUrl = platformUrlTemplate
      .replace("{url}", encodedUrl)
      .replace("{title}", encodedTitle)

    window.open(finalUrl, "_blank", "width=600,height=500,noopener,noreferrer")
  }

  const SHARE_PLATFORMS =[
    {
      name: "X (Twitter)",
      urlTemplate: "https://twitter.com/intent/tweet?text={title}&url={url}",
      color: "hover:border-stone-900 dark:hover:border-white hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      urlTemplate: "https://www.facebook.com/sharer/sharer.php?u={url}",
      color: "hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      urlTemplate: "https://wa.me/?text={title}%20{url}",
      color: "hover:border-green-600 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 dark:hover:text-green-400",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.535 5.874L.057 23.886a.5.5 0 00.612.612l6.012-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 01-5.187-1.448l-.371-.22-3.843.944.963-3.741-.242-.385A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      urlTemplate: "https://www.linkedin.com/sharing/share-offsite/?url={url}",
      color: "hover:border-blue-700 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-500",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-stone-500 dark:text-stone-400 mr-1">
        Share:
      </span>

      {/* Social Platforms */}
      {SHARE_PLATFORMS.map((platform) => (
        <button
          key={platform.name}
          onClick={() => handleSocialShare(platform.urlTemplate)}
          title={`Share on ${platform.name}`}
          aria-label={`Share on ${platform.name}`}
          className={`w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 ${platform.color}`}
        >
          {platform.icon}
        </button>
      ))}

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        title="Copy link"
        aria-label="Copy link"
        className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 ${
          copied
            ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            : "border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white"
        }`}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  )
}