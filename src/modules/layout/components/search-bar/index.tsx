"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const countryCode = useParams().countryCode as string

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      router.push(`/${countryCode}/store`)
      return
    }
    router.push(`/${countryCode}/store?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full relative flex items-center">
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, or categories across Marketplace..."
          className="w-full pl-10 pr-24 py-2 bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all shadow-inner"
        />
        <svg
          className="absolute left-3.5 top-2.5 sm:top-3 w-4 h-4 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 rounded-md transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}
