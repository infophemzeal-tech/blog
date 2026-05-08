"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";
const EXPIRY_MS = 180 * 24 * 60 * 60 * 1000; // ✅ FIX 12: 6 months expiration

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const { expiry } = JSON.parse(stored);
        // If consent hasn't expired, don't show the banner
        if (Date.now() < expiry) return;
        // If it has expired, clear it so we can ask again
        localStorage.removeItem(CONSENT_KEY);
      }
    } catch (e) {
      // Ignore JSON parse errors
    }

    const timer = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const saveConsent = (choice: "accepted" | "rejected") => {
    const expiry = Date.now() + EXPIRY_MS;
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, expiry }));
    setShow(false);

    // Dispatch custom event so we can react in other components (e.g., disabling analytics)
    window.dispatchEvent(new Event("cookieConsentChanged"));
  };

  const handleAccept = () => saveConsent("accepted");
  const handleReject = () => saveConsent("rejected");
  const handleManage = () => {
    // Optional: save a temporary "managed" state so it hides while they view the policy
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: "managing", expiry: Date.now() + 3600000 }));
    setShow(false);
    window.location.href = "/cookies";
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="false" // ✅ FIX 12: Set to false so screen readers don't trap focus over the whole page
      aria-label="Cookie consent"
      // ✅ FIX 12: Full-width slim strip (70px tall) instead of bulky floating card
      className="fixed bottom-0 left-0 right-0 z-[100] 
                 bg-stone-900 dark:bg-stone-950 border-t border-stone-700 dark:border-stone-800
                 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-4">
        
        {/* Condensed text to fit the strip */}
        <p className="text-[13px] sm:text-sm text-stone-300 leading-snug hidden sm:block">
          We use cookies to improve your experience.{" "}
          <Link 
            href="/cookies" 
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Cookie Policy
          </Link>
        </p>
        <p className="text-[12px] text-stone-300 leading-snug sm:hidden">
          We use cookies.{" "}
          <Link href="/cookies" className="text-emerald-400 underline">Learn more</Link>
        </p>

        {/* ✅ FIX 12: Three equal, inline buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleAccept}
            className="px-3 sm:px-4 py-2 bg-white text-black text-xs sm:text-sm font-semibold rounded-lg 
                       hover:bg-stone-100 active:scale-95 transition-all whitespace-nowrap"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-stone-300 border border-stone-600 
                       hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
          >
            Reject
          </button>
          <button
            onClick={handleManage}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-stone-300 border border-stone-600 
                       hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
          >
            Manage
          </button>
        </div>

      </div>
    </div>
  );
}