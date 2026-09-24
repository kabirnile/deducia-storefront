import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Extract category IDs for the current product
  const categoryIds = (product.categories || []).map((c) => c.id).filter(Boolean)

  const queryParams: any = {
    limit: 20,
  }

  // Strictly filter by category if the product belongs to any category
  if (categoryIds.length > 0) {
    queryParams["category_id"] = categoryIds
  } else if (product.collection_id) {
    queryParams["collection_id"] = [product.collection_id]
  }

  // Fetch candidate products live from backend (cache: "no-store")
  let { response } = await listProducts({
    queryParams,
    countryCode,
  })

  // Exclude current active product
  let suggested = (response.products || []).filter((p) => p.id !== product.id)

  // If category has fewer than 4 products, fallback to latest new store products
  if (suggested.length < 4) {
    const fallbackRes = await listProducts({
      queryParams: { limit: 12 },
      countryCode,
    })
    const additional = (fallbackRes.response.products || []).filter(
      (p) => p.id !== product.id && !suggested.some((s) => s.id === p.id)
    )
    suggested = [...suggested, ...additional]
  }

  const finalProducts = suggested.slice(0, 4)

  if (!finalProducts.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
          Related Products
        </span>
        <p className="text-2xl font-bold tracking-tight text-neutral-900">
          You might also like
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {finalProducts.map((p) => (
          <li key={p.id}>
            <Product product={p} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
