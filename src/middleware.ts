import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "https://api.nearsy.store"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const DEFAULT_REGION = "in"

// Fail-safe default region for India
const fallbackIndiaRegion: HttpTypes.StoreRegion = {
  id: "reg_in_default",
  name: "India",
  currency_code: "inr",
  countries: [
    {
      id: "ctry_in",
      iso_2: "in",
      iso_3: "ind",
      num_code: "356",
      name: "India",
      display_name: "India",
      region_id: "reg_in_default",
    } as any,
  ],
  automatic_taxes: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!regionMap.get(DEFAULT_REGION) || regionMapUpdated < Date.now() - 300 * 1000) {
    try {
      const headers: Record<string, string> = {}
      if (PUBLISHABLE_API_KEY) {
        headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY
      }

      const resp = await fetch(`${BACKEND_URL}/store/regions`, {
        headers,
        cache: "no-store",
      })

      if (resp.ok) {
        const { regions } = await resp.json()
        if (Array.isArray(regions) && regions.length > 0) {
          regionMapCache.regionMap.clear()
          regions.forEach((region: HttpTypes.StoreRegion) => {
            if (Array.isArray(region.countries) && region.countries.length > 0) {
              region.countries.forEach((c) => {
                if (c.iso_2) regionMapCache.regionMap.set(c.iso_2.toLowerCase(), region)
              })
            } else {
              regionMapCache.regionMap.set(DEFAULT_REGION, region)
            }
          })
          regionMapCache.regionMapUpdated = Date.now()
        }
      }
    } catch (e) {
      console.error("Failed to fetch regions from backend:", e)
    }

    // Always ensure India mapping exists
    if (!regionMapCache.regionMap.has(DEFAULT_REGION)) {
      regionMapCache.regionMap.set(DEFAULT_REGION, fallbackIndiaRegion)
    }
  }

  return regionMapCache.regionMap
}

export async function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const pathname = request.nextUrl.pathname
  const segments = pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase()

  // Ensure region map is warmed up
  await getRegionMap()

  // Case 1: Root path '/' -> redirect immediately to '/in'
  if (!firstSegment) {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_REGION}`
    return NextResponse.redirect(url)
  }

  // Case 2: First segment is an invalid or foreign country code -> redirect to '/in'
  if (firstSegment.length === 2 && firstSegment !== DEFAULT_REGION) {
    const remaining = segments.slice(1).join("/")
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_REGION}${remaining ? `/${remaining}` : ""}`
    return NextResponse.redirect(url)
  }

  // Case 3: URL starts with a route directly (e.g., /store, /cart, /account) -> prefix with /in
  if (firstSegment.length !== 2) {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_REGION}${pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
