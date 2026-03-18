// components/CookieConsent.tsx (Client Component)
"use client"
import { useState, useEffect } from "react"

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem("cookie-consent", "true")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-80 bg-stone-900 text-white p-5 rounded-2xl shadow-2xl z-[100] border border-stone-800 animate-in slide-in-from-bottom-10">
      <p className="text-xs leading-relaxed mb-4 opacity-80">
        We use cookies to keep you signed in and understand how you read. By continuing, you agree to our <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
      <button onClick={accept} className="w-full bg-white text-black py-2 rounded-full text-xs font-bold hover:bg-stone-200 transition-colors">
        Accept
      </button>
    </div>
  )
}