"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { searchInstantProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<HttpTypes.StoreProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Open modal on Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  // Debounced autocomplete query
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const items = await searchInstantProducts({
          query: trimmed,
          countryCode,
          limit: 6,
        })
        setResults(items)
      } catch (err) {
        console.error("Search failed:", err)
      } finally {
        setIsLoading(false)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [query, countryCode])

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsOpen(false)
    router.push(`/${countryCode}/store?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      {/* Header Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-x-2 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        aria-label="Search products"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-block text-[10px] bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-neutral-400">
          ⌘K
        </kbd>
      </button>

      {/* Apple-Style Spotlight Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <form onSubmit={handleFullSearch} className="flex items-center px-4 py-3.5 border-b border-neutral-200 bg-white">
              <svg className="w-5 h-5 text-neutral-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, or categories..."
                className="w-full text-sm sm:text-base outline-none text-neutral-900 placeholder-neutral-400 bg-transparent font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-2 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-md transition-colors"
              >
                Esc
              </button>
            </form>

            {/* Live Autocomplete Results Container */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {isLoading && (
                <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                  Searching catalog...
                </div>
              )}

              {!isLoading && query.trim() && results.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-neutral-800">No products found for "{query}"</p>
                  <p className="text-xs text-neutral-500 mt-1">Try checking for typos or broader keywords</p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="flex flex-col gap-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Suggested Products
                  </div>
                  {results.map((product) => {
                    const price =
                      product.variants?.[0]?.calculated_price?.calculated_amount ?? null
                    const currency =
                      product.variants?.[0]?.calculated_price?.currency_code?.toUpperCase() ?? "EUR"

                    return (
                      <Link
                        key={product.id}
                        href={`/${countryCode}/products/${product.handle}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-x-3.5 p-2.5 rounded-xl hover:bg-neutral-100 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 relative overflow-hidden flex-shrink-0 border border-neutral-200">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              fill
                              className="object-cover object-center"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                              Item
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold text-neutral-900 truncate group-hover:text-black">
                            {product.title}
                          </span>
                          <span className="text-xs text-neutral-500 truncate">
                            {product.categories?.[0]?.name || product.collection?.title || "Marketplace"}
                          </span>
                        </div>
                        {price !== null && (
                          <div className="text-xs font-bold text-neutral-900 px-2 py-1 bg-white rounded-md border border-neutral-200 shadow-sm">
                            {currency} {price}
                          </div>
                        )}
                      </Link>
                    )
                  })}

                  {/* View All Matches Footer */}
                  <button
                    onClick={handleFullSearch}
                    className="mt-2 w-full py-2.5 text-center text-xs font-bold text-white bg-black hover:bg-neutral-900 rounded-xl transition-colors shadow-sm"
                  >
                    View all results for "{query}" →
                  </button>
                </div>
              )}

              {!query.trim() && (
                <div className="py-6 px-4 text-xs text-neutral-500 flex items-center justify-between">
                  <span>Quick searches: Shoes, Sneakers, Sandal, Sport...</span>
                  <span className="text-[11px] text-neutral-400">Press ↵ to search</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
