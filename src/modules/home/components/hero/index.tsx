"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const banners = [
  {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
    title: "Fresh Groceries & Daily Essentials",
    subtitle: "Direct from verified local stores in your neighbourhood",
    tag: "INSTANT DISPATCH",
  },
  {
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1200&auto=format&fit=crop",
    title: "Snacks, Drinks & Quick Munchies",
    subtitle: "Late-night delivery right to your hostel or doorstep",
    tag: "10-15 MINS",
  },
  {
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop",
    title: "Trending Footwear & Apparel",
    subtitle: "Local vendors, original quality, unbeatable pricing",
    tag: "BEST PRICES",
  },
  {
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1200&auto=format&fit=crop",
    title: "Electronics, Cables & Accessories",
    subtitle: "Authentic hardware delivered within the hour",
    tag: "VERIFIED TECH",
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full content-container my-3 sm:my-5">
      {/* 1. BLINKIT DELIVERY STRIP */}
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4">
        <div className="flex items-center gap-x-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
            ⚡
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-950 block leading-tight">
              Delivery in 10-15 minutes
            </span>
            <span className="text-[11px] text-emerald-800 font-medium">
              Aligarh Central Hub • Verified Local Merchants
            </span>
          </div>
        </div>
        <LocalizedClientLink
          href="/store"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
        >
          Explore All →
        </LocalizedClientLink>
      </div>

      {/* 2. FULL-WIDTH QUICK-COMMERCE VISUAL BANNER */}
      <div className="relative w-full h-[180px] sm:h-[280px] md:h-[340px] rounded-2xl overflow-hidden shadow-md">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            {/* Contrast Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5 sm:p-8">
              <span className="inline-block bg-yellow-400 text-black font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-md mb-2 w-max shadow-sm">
                {banner.tag}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight max-w-xl">
                {banner.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200 mt-1 max-w-lg hidden sm:block">
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === i ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
