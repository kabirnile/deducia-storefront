"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const banners = [
  {
    title: "Marketplace",
    subtitle: "Your premier hyperlocal multi-vendor platform.",
    tagline: "Verified Independent Sellers",
    cta: "Find Products",
    href: "/store",
    gradient: "from-slate-900 via-indigo-950 to-slate-900",
  },
  {
    title: "Trending Footwear Collection",
    subtitle: "Sneakers, runners, and premium sandals from verified brands.",
    tagline: "Up to 40% Off Seasonal Styles",
    cta: "Find Products",
    href: "/store",
    gradient: "from-blue-950 via-slate-900 to-cyan-950",
  },
  {
    title: "Express Delivery Nationwide",
    subtitle: "Fast local delivery and real-time inventory direct to your door.",
    tagline: "Reliable Shipping Nationwide",
    cta: "Find Products",
    href: "/store",
    gradient: "from-emerald-950 via-slate-900 to-teal-950",
  },
  {
    title: "Verified Multi-Vendor Quality",
    subtitle: "Every item backed by authentic local suppliers and warranty.",
    tagline: "100% Genuine Products",
    cta: "Find Products",
    href: "/store",
    gradient: "from-violet-950 via-purple-900 to-slate-900",
  },
  {
    title: "Exclusive Launch Discounts",
    subtitle: "Use verified promotion codes on selected categories this week.",
    tagline: "Limited Time Offers",
    cta: "Find Products",
    href: "/store",
    gradient: "from-rose-950 via-slate-900 to-amber-950",
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full relative overflow-hidden rounded-2xl my-6 content-container">
      <div
        className={`w-full py-20 px-8 sm:px-16 text-white bg-gradient-to-r ${banners[current].gradient} transition-all duration-700 ease-in-out flex flex-col justify-center items-start min-h-[360px] shadow-lg rounded-2xl relative`}
      >
        <span className="text-xs uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-semibold mb-4 text-emerald-300">
          {banners[current].tagline}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
          {banners[current].title}
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 max-w-xl mb-6">
          {banners[current].subtitle}
        </p>
        <LocalizedClientLink
          href={banners[current].href}
          className="bg-white text-neutral-900 hover:bg-neutral-100 font-semibold px-6 py-3 rounded-lg text-sm shadow-md transition-all duration-200"
        >
          {banners[current].cta} →
        </LocalizedClientLink>

        {/* Indicators */}
        <div className="absolute bottom-4 right-8 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
