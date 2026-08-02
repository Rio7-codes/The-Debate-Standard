"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";

const navItem =
  "group relative flex h-full cursor-pointer items-center justify-center text-[18px] heading-font tracking-wide font-medium text-gray-800 transition-colors duration-300 hover:text-violet-700";

const underline =
  "pointer-events-none absolute bottom-[-12px] left-0 h-[2.5px] w-full origin-center scale-x-0 rounded-full bg-gradient-to-r from-violet-500 via-violet-700 to-violet-500 transition-transform duration-300 ease-out group-hover:scale-x-100";

const dropdownLink =
  "group/item relative flex cursor-pointer items-center justify-between overflow-hidden rounded-xl bg-white px-5 py-3 text-[15px] text-gray-700 transition-all duration-200 ease-out hover:text-violet-700 active:scale-[0.98]";

function ResourcesCard() {
  return (
    <Link
      href="/resources"
      className="group/item relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-violet-700 px-4 py-3 shadow-[0_6px_16px_-6px_rgba(109,40,217,0.4)] transition-all duration-300 ease-out hover:-translate-y-[1px] hover:shadow-[0_10px_26px_-6px_rgba(109,40,217,0.55)] active:translate-y-0 active:scale-[0.97]"
    >
      {/* darkening wash sweep on hover */}
      <span
        aria-hidden
        className="absolute inset-0 -z-0 origin-left scale-x-0 bg-black/10 transition-transform duration-300 ease-out group-hover/item:scale-x-100"
      />

      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all duration-300 ease-out group-hover/item:scale-110 group-hover/item:rotate-[10deg] group-hover/item:bg-white/25">
        <Sparkles size={15} strokeWidth={2.2} />
      </span>

      <span className="relative z-10 flex flex-1 flex-col">
        <span className="text-[15px] font-semibold text-white">
          Resources
        </span>
        <span className="text-[12px] text-violet-100">
          Guides, articles &amp; tools
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E2D2] bg-[#FBFAF6]/95 shadow-sm backdrop-blur-md">

      {/* Signature hairline — violet blending into gold */}
      <div className="h-[2px] w-full bg-gradient-to-r from-violet-600 via-[#D4AF37] to-violet-600" />

      <div className="mx-auto flex h-[80px] max-w-[1600px] items-center px-12">

        {/* LEFT */}

        <div className="flex shrink-0 items-center">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/logo1.png"
              alt="The Debate Standard"
              width={320}
              height={80}
              priority
              className="h-[60px] w-auto object-contain transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.99]"
            />
          </Link>
        </div>

        {/* CENTER */}

        <div className="flex flex-1 justify-center">
          <nav className="flex items-center gap-16">

            {/* About */}

            <Link href="/about" className={navItem}>
              About
              <span className={underline} />
            </Link>

            {/* Learn Debating */}

            <div className="group relative flex h-full items-center">

              <button className={navItem} type="button">
                Learn Debating

                <ChevronDown
                  size={16}
                  className="ml-2 transition-transform duration-300 ease-out group-hover:rotate-180 group-hover:text-violet-700"
                />

                <span className={underline} />
              </button>

              {/* Dropdown */}

              <div
                className="
                  invisible
                  absolute
                  left-1/2
                  top-[60px]
                  z-50
                  w-[340px]
                  -translate-x-1/2
                  translate-y-2
                  scale-[0.97]
                  rounded-2xl
                  border
                  border-[#E8E2D2]
                  bg-[#FBFAF6]/95
                  p-2
                  opacity-0
                  shadow-[0_25px_60px_-15px_rgba(76,29,149,0.25)]
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  ease-out
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:scale-100
                  group-hover:opacity-100
                "
              >
                <div className="mx-1 mb-1 h-[3px] w-10 rounded-full bg-gradient-to-r from-violet-600 to-[#C9A227]" />

                <Link href="/learn/basics" className={dropdownLink}>
                  <span className="relative z-10">Basics</span>
                  <ArrowRight
                    size={15}
                    className="relative z-10 -translate-x-1 opacity-0 transition-all duration-200 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100"
                  />
                  <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-violet-50 transition-transform duration-200 ease-out group-hover/item:scale-x-100" />
                </Link>

                <Link href="/learn/public-speaking" className={dropdownLink}>
                  <span className="relative z-10">Public Speaking</span>
                  <ArrowRight
                    size={15}
                    className="relative z-10 -translate-x-1 opacity-0 transition-all duration-200 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100"
                  />
                  <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-violet-50 transition-transform duration-200 ease-out group-hover/item:scale-x-100" />
                </Link>

                <Link href="/learn/british-parliamentary" className={dropdownLink}>
                  <span className="relative z-10">British Parliamentary</span>
                  <ArrowRight
                    size={15}
                    className="relative z-10 -translate-x-1 opacity-0 transition-all duration-200 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100"
                  />
                  <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-violet-50 transition-transform duration-200 ease-out group-hover/item:scale-x-100" />
                </Link>

                <Link href="/learn/asian-parliamentary" className={dropdownLink}>
                  <span className="relative z-10">Asian Parliamentary</span>
                  <ArrowRight
                    size={15}
                    className="relative z-10 -translate-x-1 opacity-0 transition-all duration-200 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100"
                  />
                  <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-violet-50 transition-transform duration-200 ease-out group-hover/item:scale-x-100" />
                </Link>

                <div className="my-2 h-px bg-[#E8E2D2]" />

                <ResourcesCard />

              </div>

            </div>

            {/* People */}

            <Link href="/people" className={navItem}>
              People
              <span className={underline} />
            </Link>

          </nav>
        </div>

        {/* RIGHT — visual only for now: hover + click animation, no menu wired up yet */}

        <div className="flex w-14 shrink-0 justify-end">
          <button
            type="button"
            aria-label="Menu"
            className="group flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-lg transition-all duration-300 ease-out hover:bg-violet-50 active:scale-[0.94]"
          >
            <span className="h-[2.5px] w-7 rounded-full bg-violet-700 transition-all duration-300 ease-out group-hover:-translate-y-[1px] group-hover:w-8 group-hover:bg-violet-800" />
            <span className="h-[2.5px] w-7 rounded-full bg-[#D4AF37] transition-all duration-300 ease-out group-hover:w-4" />
            <span className="h-[2.5px] w-7 rounded-full bg-violet-700 transition-all duration-300 ease-out group-hover:translate-y-[1px] group-hover:w-8 group-hover:bg-violet-800" />
          </button>
        </div>

      </div>
    </header>
  );
}