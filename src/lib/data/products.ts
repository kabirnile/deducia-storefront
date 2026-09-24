"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

function cleanUrl(url?: string | null): string | null {
  if (!url) return null
  return url
    .replace(/http:\/\/localhost:9000/g, "https://api.nearsy.store")
    .replace(/http:\/\/127\.0\.0\.1:9000/g, "https://api.nearsy.store")
}

function sanitizeProductAssets(product: HttpTypes.StoreProduct): HttpTypes.StoreProduct {
  if (!product) return product

  const sanitized = { ...product }

  if (sanitized.thumbnail) {
    sanitized.thumbnail = cleanUrl(sanitized.thumbnail)
  }

  if (Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images.map((img: any) => ({
      ...img,
      url: cleanUrl(img.url) || img.url,
    }))
  }

  if (Array.isArray(sanitized.variants)) {
    sanitized.variants = sanitized.variants.map((v: any) => {
      const vCopy = { ...v }
      if (Array.isArray(vCopy.images)) {
        vCopy.images = vCopy.images.map((vImg: any) => ({
          ...vImg,
          url: cleanUrl(vImg.url) || vImg.url,
        }))
      }
      return vCopy
    })
  }

  return sanitized
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams & { q?: string; category_id?: string[] }
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*thumbnail,*images,+metadata,+tags,*categories",
          ...queryParams,
        },
        headers,
        cache: "no-store",
      }
    )
    .then(({ products, count }) => {
      let cleanProducts = (products || []).map(sanitizeProductAssets)

      // Fallback substring search across title, description, and handle
      if (queryParams?.q && queryParams.q.trim().length > 0) {
        const searchTerm = queryParams.q.toLowerCase().trim()
        cleanProducts = cleanProducts.filter(
          (p) =>
            p.title?.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm) ||
            p.handle?.toLowerCase().includes(searchTerm) ||
            p.categories?.some((c) => c.name?.toLowerCase().includes(searchTerm))
        )
      }

      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products: cleanProducts,
          count: cleanProducts.length,
        },
        nextPage,
        queryParams,
      }
    })
    .catch((err) => {
      console.error("Error fetching products list:", err)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
        queryParams,
      }
    })
}

export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams & { q?: string }
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)
  const safePage = Math.max(page, 1)
  const pageParam = (safePage - 1) * limit
  const nextPage = count > pageParam + limit ? safePage + 1 : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

/**
 * Live instant search suggestions with product thumbnails and pricing
 */
export async function searchInstantProducts({
  query,
  countryCode,
  limit = 6,
}: {
  query: string
  countryCode: string
  limit?: number
}) {
  const trimmed = query?.trim()
  if (!trimmed || trimmed.length === 0) return []

  const { response } = await listProducts({
    countryCode,
    queryParams: {
      limit: 50,
      q: trimmed,
    },
  })

  return (response.products || []).slice(0, limit)
}
