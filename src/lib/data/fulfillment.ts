"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders } from "./cookies"

export const listCartShippingMethods = async (cartId: string) => {
  if (!cartId) return []

  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  return sdk.client
    .fetch<any>(
      `/store/shipping-options`,
      {
        method: "GET",
        query: {
          cart_id: cartId,
        },
        headers,
        cache: "no-store", // Crucial: prevents Next.js from caching empty states
      }
    )
    .then((res: any) => {
      // 1. If it's already a flat array, return it
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.shipping_options)) return res.shipping_options

      // 2. If it's a multi-vendor grouped object { "sel_123": [...] }, flatten it
      if (res?.shipping_options && typeof res.shipping_options === "object") {
        const flattenedOptions: HttpTypes.StoreCartShippingOption[] = []
        Object.values(res.shipping_options).forEach((vendorOptions: any) => {
          if (Array.isArray(vendorOptions)) {
            flattenedOptions.push(...vendorOptions)
          }
        })
        return flattenedOptions
      }

      return []
    })
    .catch((err) => {
      console.error("Error fetching shipping methods:", err)
      return [] as HttpTypes.StoreCartShippingOption[]
    })
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  const body: Record<string, any> = { cart_id: cartId }

  if (data) {
    body.data = data
  }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
        cache: "no-store",
      }
    )
    .then(({ shipping_option }) => shipping_option)
    .catch(() => null)
}
