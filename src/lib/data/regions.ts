"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders } from "./cookies"

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

export const listRegions = async () => {
  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ regions }) => {
      if (Array.isArray(regions) && regions.length > 0) {
        return regions.map((r) => {
          if (!r.countries || r.countries.length === 0) {
            r.countries = fallbackIndiaRegion.countries
          }
          return r
        })
      }
      return [fallbackIndiaRegion]
    })
    .catch(() => [fallbackIndiaRegion])
}

export const retrieveRegion = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ region }) => region)
    .catch(() => fallbackIndiaRegion)
}

export const getRegion = async (countryCode: string) => {
  const regions = await listRegions()
  const cleanCode = (countryCode || "in").toLowerCase()

  const found = regions.find((r) =>
    r.countries?.some((c) => c.iso_2?.toLowerCase() === cleanCode)
  )

  return found || regions[0] || fallbackIndiaRegion
}
