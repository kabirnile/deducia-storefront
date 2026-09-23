import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import Hero from "@modules/home/components/hero"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Aligarh Marketplace | Powered by Deducia Inc.",
  description: "Hyperlocal multi-vendor marketplace powered by Deducia Inc.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  const categories = await listCategories()
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      limit: 50,
      fields: "*variants.calculated_price",
    },
  })

  if (!region) {
    return null
  }

  return (
    <div className="w-full flex flex-col gap-y-12 pb-16">
      {/* 1. HERO 5-BANNER CAROUSEL */}
      <Hero />

      {/* 2. CATEGORIES SECTION */}
      {categories && categories.length > 0 && (
        <section className="content-container">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                Explore Categories
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Shop curated selections from vendors across the region
              </p>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 underline underline-offset-4"
            >
              View all
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <LocalizedClientLink
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors flex flex-col justify-between h-24"
              >
                <span className="font-semibold text-sm text-neutral-800">
                  {cat.name}
                </span>
                <span className="text-xs text-neutral-500">Shop category →</span>
              </LocalizedClientLink>
            ))}
          </div>
        </section>
      )}

      {/* 3. ALL PRODUCTS CATALOG GRID */}
      <section className="content-container">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              All Products
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Browse the entire multi-vendor inventory available for your region
            </p>
          </div>
          <span className="text-xs font-medium text-neutral-500">
            Showing {response?.products?.length || 0} products
          </span>
        </div>

        <div
          className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
          data-testid="products-list"
        >
          {response?.products && response.products.length > 0 ? (
            response.products.map((product) => (
              <ProductPreview
                key={product.id}
                product={product}
                region={region}
              />
            ))
          ) : (
            <p className="text-sm text-neutral-500 col-span-full">
              No products found in this region.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
