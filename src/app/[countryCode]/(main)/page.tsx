import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import Hero from "@modules/home/components/hero"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const revalidate = 0 // Never serve stale cache: always live data

export const metadata: Metadata = {
  title: "Marketplace | Multi-Vendor Store",
  description: "Premier multi-vendor marketplace connecting verified independent sellers.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  const categories = await listCategories({
    fields: "id,name,handle,description",
  })
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      limit: 100,
      fields: "*variants.calculated_price,*thumbnail,*images",
    },
  })

  if (!region) {
    return null
  }

  return (
    <div className="w-full flex flex-col gap-y-12 pb-16">
      {/* 1. HERO 5-BANNER CAROUSEL WITH FIND PRODUCTS */}
      <Hero />

      {/* 2. EXPLORE CATEGORIES */}
      {categories && categories.length > 0 && (
        <section className="content-container">
          <div className="flex flex-col items-start gap-y-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Explore Categories
            </h2>
            <p className="text-sm text-neutral-500">
              Shop curated selections from verified marketplace sellers
            </p>
            <LocalizedClientLink
              href="/store"
              className="mt-1 inline-flex items-center justify-center px-4 py-2 bg-black hover:bg-neutral-900 text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
            >
              View All
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <LocalizedClientLink
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className="p-4 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-300 transition-all flex flex-col justify-between h-24 shadow-sm hover:border-neutral-900 group"
              >
                <span className="font-bold text-sm sm:text-base text-neutral-950 group-hover:text-black">
                  {cat.name || cat.handle}
                </span>
                <span className="text-xs font-semibold text-neutral-600 group-hover:text-black">
                  Shop category →
                </span>
              </LocalizedClientLink>
            ))}
          </div>
        </section>
      )}

      {/* 3. ALL PRODUCTS */}
      <section className="content-container">
        <div className="flex flex-col items-start gap-y-2 mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            All Products
          </h2>
          <p className="text-sm text-neutral-500">
            Browse the entire multi-vendor catalog ({response?.products?.length || 0} products available)
          </p>
          <LocalizedClientLink
            href="/store"
            className="mt-1 inline-flex items-center justify-center px-4 py-2 bg-black hover:bg-neutral-900 text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
          >
            View All
          </LocalizedClientLink>
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
