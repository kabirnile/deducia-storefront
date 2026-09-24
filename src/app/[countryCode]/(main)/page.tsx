import { Metadata } from "next"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import Hero from "@modules/home/components/hero"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const revalidate = 0

export const metadata: Metadata = {
  title: "Marketplace | 10-Minute Hyperlocal Delivery",
  description: "Order fresh essentials, electronics, and lifestyle goods with instant local delivery.",
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
      fields: "*variants.calculated_price,+variants.inventory_quantity,*thumbnail,*images",
    },
  })

  return (
    <div className="w-full flex flex-col gap-y-6 pb-20 bg-neutral-50/50 min-h-screen">
      {/* 1. VISUAL HERO & INSTANT STRIP */}
      <Hero />

      {/* 2. DYNAMIC LIVE CATEGORIES (BLINKIT HORIZONTAL / GRID) */}
      {categories && categories.length > 0 && (
        <section className="content-container">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
                Shop by Category
              </h2>
              <span className="text-xs text-neutral-500 font-medium">
                Live from verified vendors
              </span>
            </div>
            <LocalizedClientLink
              href="/store"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              See All →
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
            {categories.map((cat) => (
              <LocalizedClientLink
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className="flex flex-col items-center justify-center p-3 bg-white border border-neutral-200/80 rounded-xl hover:border-emerald-600 hover:shadow-sm transition-all group text-center aspect-[1/1]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-base font-black group-hover:scale-110 transition-transform mb-2">
                  {cat.name?.charAt(0) || "🛍"}
                </div>
                <span className="text-xs font-bold text-neutral-800 line-clamp-1 group-hover:text-emerald-700">
                  {cat.name}
                </span>
              </LocalizedClientLink>
            ))}
          </div>
        </section>
      )}

      {/* 3. DYNAMIC PRODUCTS GRID (BLINKIT COMPACT CARDS) */}
      <section className="content-container">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
              All Products
            </h2>
            <span className="text-xs text-neutral-500 font-medium">
              {response?.products?.length || 0} items available for delivery
            </span>
          </div>
          <LocalizedClientLink
            href="/store"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Full Catalog →
          </LocalizedClientLink>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
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
            <div className="col-span-full py-16 text-center bg-white border border-dashed border-neutral-300 rounded-2xl p-6">
              <span className="text-3xl block mb-2">📦</span>
              <p className="text-sm font-bold text-neutral-800">
                Fresh Catalog Synchronizing
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No items uploaded yet. When an onboarded merchant publishes items in their Seller Portal, they appear here live.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
