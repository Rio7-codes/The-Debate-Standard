"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "tds-acknowledgement-seen";

export default function AcknowledgementModal() {
  // null = "haven't checked sessionStorage yet" (avoids a flash on repeat visits)
  const [show, setShow] = useState<boolean | null>(null);
  const [animate, setAnimate] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // sessionStorage unavailable (e.g. privacy mode) — fail open and show it
    }

    if (alreadySeen) {
      setShow(false);
      return;
    }

    setShow(true);
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleAgree() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — worst case the modal reappears on the next page
    }

    setAnimate(false);
    setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 280);
  }

  function handleExit() {
    setAnimate(false);
    setTimeout(() => setLocked(true), 280);
  }

  // Full-site lockout — rendered instead of the app once the user exits.
  if (locked) {
    return (
      <div
        aria-live="assertive"
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B0810] px-6 text-center"
        style={{ pointerEvents: "all" }}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div className="max-w-sm">
          <div className="mx-auto mb-6 h-[3px] w-14 rounded-full bg-gradient-to-r from-violet-500 to-[#D4AF37]" />
          <h2 className="heading-font text-2xl tracking-wide text-white">
            SITE ACCESS DECLINED
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            You&apos;ve chosen to exit. This site is no longer interactive in
            this tab — you may close it now.
          </p>
        </div>
      </div>
    );
  }

  if (show === null || show === false) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tds-ack-heading"
      className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-all duration-300 ease-out ${
        animate
          ? "bg-[#0B0810]/60 backdrop-blur-md"
          : "bg-[#0B0810]/0 backdrop-blur-none"
      }`}
    >
      <div
        className={`relative w-full max-w-[600px] overflow-hidden rounded-2xl border border-[#E8DCC0] bg-[#FBFAF6] shadow-[0_40px_100px_-20px_rgba(76,29,149,0.35)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animate
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-[0.96] opacity-0"
        }`}
      >
        {/* Gradient accent bar — spreads from center outward */}
        <div className="relative h-[4px] w-full overflow-hidden bg-violet-100">
          <div
            className={`absolute inset-y-0 left-0 right-0 origin-center bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-800 transition-transform duration-700 ease-out ${
              animate ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </div>

        {/* Ambient glow behind the logo */}
        <div className="pointer-events-none absolute left-1/2 top-4 h-28 w-28 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="px-8 py-6 sm:px-10 sm:py-7">
          {/* Logo */}
          <div
            className={`flex justify-center transition-all duration-500 delay-[80ms] ease-out ${
              animate ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <Image
              src="/logo.jpg"
              alt="The Debate Standard"
              width={190}
              height={55}
              priority
              className="h-9 w-auto select-none object-contain"
            />
          </div>

          {/* Heading */}
          <h1
            id="tds-ack-heading"
            className={`heading-font mt-5 text-center text-[26px] tracking-wide text-gray-900 transition-all duration-500 delay-[140ms] ease-out sm:text-[30px] ${
              animate ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            User Acknowledgement
          </h1>

          <div
            className={`mx-auto mt-3 h-[3px] w-14 rounded-full bg-gradient-to-r from-violet-500 to-violet-800 transition-all duration-500 delay-[200ms] ease-out ${
              animate ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
          />

          {/* Content area — populated by the editor. No visible container by design. */}
          <div
            className={`mt-5 px-1 transition-all duration-500 delay-[220ms] ease-out ${
              animate ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <div className="min-h-[80px] text-[15px] leading-relaxed text-gray-700">
              {/*
                  Leave this area empty.
                  The acknowledgement copy goes here.
              */}
            </div>
          </div>

          {/* Buttons */}
          <div
            className={`mt-6 flex gap-3 transition-all duration-500 delay-[280ms] ease-out ${
              animate ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {/* Exit Site — quiet by default, warns in red on interaction */}
            <button
              type="button"
              onClick={handleExit}
              className="group relative flex-1 cursor-pointer overflow-hidden rounded-md border border-gray-300 bg-white py-2.5 text-[13px] font-semibold uppercase tracking-[0.20em] text-gray-600 transition-all duration-200 ease-out hover:border-red-300 hover:text-red-600 active:scale-[0.97] active:border-red-400"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-center scale-x-0 bg-red-50 transition-transform duration-300 ease-out group-hover:scale-x-100 group-active:bg-red-100"
              />
              <span className="relative">Exit Site</span>
            </button>

            {/* I Agree — gradient lift with a light sweep on hover */}
            <button
              type="button"
              onClick={handleAgree}
              className="group relative flex-1 cursor-pointer overflow-hidden rounded-md bg-gradient-to-r from-violet-600 to-violet-800 py-2.5 text-[13px] font-semibold uppercase tracking-[0.20em] text-white shadow-[0_8px_20px_-6px_rgba(109,40,217,0.55)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_12px_28px_-6px_rgba(109,40,217,0.7)] active:translate-y-0 active:scale-[0.97] active:shadow-[0_6px_14px_-6px_rgba(109,40,217,0.5)]"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-[20deg] bg-white/25 opacity-0 transition-all duration-500 ease-out group-hover:left-[120%] group-hover:opacity-100"
              />
              <span className="relative">I Agree</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}