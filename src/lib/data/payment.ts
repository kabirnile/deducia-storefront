"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then((res: any) => {
      const providers = Array.isArray(res)
        ? res
        : Array.isArray(res?.payment_providers)
        ? res.payment_providers
        : []

      return providers.sort((a: any, b: any) => {
        return (a?.id || "") > (b?.id || "") ? 1 : -1
      })
    })
    .catch(() => {
      return [] as HttpTypes.StorePaymentProvider[]
    })
}
