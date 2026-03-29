"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (choice: "accepted" | "rejected") => {
    localStorage.setItem("cookie-consent", choice);
    setShow(false);

    // Dispatch custom event so we can react in other components
    window.dispatchEvent(new Event("cookieConsentChanged"));
  };

  const handleAccept = () => saveConsent("accepted");
  const handleReject = () => saveConsent("rejected");
  const handleManage = () => window.location.href = "/cookies";

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[380px] 
                 bg-stone-900 border border-stone-700 text-white p-6 rounded-3xl 
                 shadow-2xl z-[100] animate-in slide-in-from-bottom-8"
    >
      <div className="space-y-5">
        <div>
          <h2 id="cookie-title" className="font-semibold text-lg mb-2">
            🍪 We use cookies
          </h2>
          <p className="text-[15px] leading-relaxed text-stone-300">
            Nairaly uses cookies to keep you signed in, analyse traffic, and 
            improve your experience. 
            <br className="hidden sm:block" />
            See our{" "}
            <Link 
              href="/cookies" 
              className="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/30 underline-offset-4"
            >
              Cookie Policy
            </Link>
            {" "}for details.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAccept}
            className="w-full py-3.5 bg-white text-black font-semibold rounded-2xl 
                       hover:bg-stone-100 active:scale-[0.985] transition-all"
          >
            Accept All Cookies
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="flex-1 py-3 text-sm font-medium border border-stone-600 
                         hover:bg-stone-800 rounded-2xl transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleManage}
              className="flex-1 py-3 text-sm font-medium border border-stone-600 
                         hover:bg-stone-800 rounded-2xl transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}