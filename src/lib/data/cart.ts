"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { getLocale } from "@lib/data/locale-actions"

export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??=
    "*items, *region, *region.countries, *shipping_address, *billing_address, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, *shipping_methods"

  if (!id) return null

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("carts")) }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: { fields },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)
  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  let cart = await retrieveCart(undefined, "id,region_id")
  const headers = { ...(await getAuthHeaders()) }

  if (!cart) {
    const locale = await getLocale()
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id, locale: locale || undefined },
      {},
      headers
    )
    cart = cartResp.cart
    await setCartId(cart.id)
    revalidateTag(await getCacheTag("carts"))
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    revalidateTag(await getCacheTag("carts"))
  }
  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No existing cart found, please create one before updating")

  const headers = { ...(await getAuthHeaders()) }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) throw new Error("Missing variant ID when adding to cart")

  const cart = await getOrSetCart(countryCode)
  if (!cart) throw new Error("Error retrieving or creating cart")

  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  let offerId: string | null = null
  try {
    const offerRes = await sdk.client.fetch<{ offers: { id: string }[] }>(
      `/store/offers?variant_id=${variantId}`,
      { method: "GET", headers, cache: "no-store" }
    )
    if (offerRes?.offers && offerRes.offers.length > 0) {
      offerId = offerRes.offers[0].id
    }
  } catch (err) {
    console.error("Error querying /store/offers:", err)
  }

  const payload: Record<string, any> = { quantity }
  if (offerId) {
    payload.offer_id = offerId
  } else {
    payload.variant_id = variantId
  }

  return await sdk.client
    .fetch(`/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers,
      body: payload,
    })
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
    })
    .catch(medusaError)
}

export async function updateLineItem({ lineId, quantity }: { lineId: string; quantity: number }) {
  const cartId = await getCartId()
  if (!cartId || !lineId) throw new Error("Missing cart or line ID")

  const headers = { ...(await getAuthHeaders()) }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  const cartId = await getCartId()
  if (!cartId || !lineId) throw new Error("Missing cart or line ID")

  const headers = { ...(await getAuthHeaders()) }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
    })
    .catch(medusaError)
}

export async function setShippingMethod({ cartId, shippingMethodId }: { cartId: string; shippingMethodId: string }) {
  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(cart: HttpTypes.StoreCart, data: HttpTypes.StoreInitializePaymentSession) {
  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      revalidateTag(await getCacheTag("carts"))
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) return "No existing cart found"

  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  try {
    await sdk.store.cart.update(cartId, { promo_codes: codes }, {}, headers)
    revalidateTag(await getCacheTag("carts"))
    revalidateTag(await getCacheTag("fulfillment"))
    return null
  } catch (err: any) {
    return err?.message || "Invalid promotion code"
  }
}

export async function applyGiftCard(code: string) {}
export async function removeDiscount(code: string) {}
export async function removeGiftCard(codeToRemove: string, giftCards: any[]) {}

export async function submitPromotionForm(currentState: unknown, formData: FormData) {
  const code = (formData.get("code") as string)?.trim()
  if (!code) return "Please enter a promotion code"
  try {
    const errorMsg = await applyPromotions([code])
    if (errorMsg) return errorMsg
    return null
  } catch (e: any) {
    return e?.message || "Invalid promotion code"
  }
}

export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) throw new Error("No form data found when setting addresses")
    const cartId = await getCartId()
    if (!cartId) throw new Error("No existing cart found when setting addresses")

    const countryCode = (formData.get("shipping_address.country_code") as string)?.toLowerCase() || "in"

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: countryCode,
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: countryCode,
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }
  redirect(`/${formData.get("shipping_address.country_code")}/checkout?step=delivery`)
}

/**
 * Places an order for a cart and redirects cleanly to the order confirmed screen
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) throw new Error("No existing cart found when placing an order")

  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  let cartRes: any = null
  try {
    cartRes = await sdk.client.fetch<any>(`/store/carts/${id}/complete`, {
      method: "POST",
      headers,
    })
  } catch (err: any) {
    throw new Error(medusaError(err))
  }

  // Clear cart cache
  revalidateTag(await getCacheTag("carts"))
  revalidateTag(await getCacheTag("orders"))

  // Resolve Order ID across Medusa v2 and Mercur multi-vendor payload structures
  const order =
    cartRes?.order ||
    (Array.isArray(cartRes?.orders) ? cartRes.orders[0] : null) ||
    (cartRes?.type === "order" ? cartRes.order : null) ||
    cartRes

  const orderId = order?.id || (cartRes?.id?.startsWith("order_") ? cartRes.id : null)

  if (orderId) {
    const countryCode =
      order?.shipping_address?.country_code?.toLowerCase() ||
      order?.billing_address?.country_code?.toLowerCase() ||
      "in"

    await removeCartId()
    redirect(`/${countryCode}/order/${orderId}/confirmed`)
  }

  return cartRes?.cart || cartRes
}

export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)
  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag(await getCacheTag("carts"))
  }
  revalidateTag(await getCacheTag("regions"))
  revalidateTag(await getCacheTag("products"))
  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  if (!cartId) return []

  const headers = {
    ...(await getAuthHeaders()),
    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
      : {}),
  }

  return await sdk.client
    .fetch<any>("/store/shipping-options", {
      method: "GET",
      query: { cart_id: cartId },
      headers,
      cache: "no-store",
    })
    .then((res: any) => {
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.shipping_options)) return res.shipping_options

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
    .catch(() => [] as HttpTypes.StoreCartShippingOption[])
}
