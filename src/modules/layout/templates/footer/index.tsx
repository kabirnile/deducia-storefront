import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-neutral-200 w-full bg-neutral-50 text-neutral-700">
      <div className="content-container flex flex-col w-full py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10">
          {/* Brand Col */}
          <div className="flex flex-col items-start gap-y-3">
            <LocalizedClientLink
              href="/"
              className="text-lg font-bold uppercase tracking-wider text-neutral-900"
            >
              Marketplace
            </LocalizedClientLink>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
              Hyperlocal marketplace connecting verified independent vendors and customers with fast, reliable fulfillment.
            </p>
            <div className="pt-2">
              <a
                href="https://api.nearsy.store/seller/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-all inline-block shadow-sm"
              >
                Sell
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-y-2 text-xs">
            <span className="font-semibold text-neutral-900 text-sm mb-1">
              Customer Support
            </span>
            <LocalizedClientLink
              href="/customer-service"
              className="hover:text-neutral-900 transition-colors py-0.5"
            >
              Customer Service & FAQ
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="hover:text-neutral-900 transition-colors py-0.5"
            >
              All Products
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/cart"
              className="hover:text-neutral-900 transition-colors py-0.5"
            >
              Shopping Cart
            </LocalizedClientLink>
          </div>

          {/* Categories */}
          {productCategories && productCategories.length > 0 && (
            <div className="flex flex-col gap-y-2 text-xs">
              <span className="font-semibold text-neutral-900 text-sm mb-1">
                Categories
              </span>
              {productCategories.slice(0, 5).map((c) => (
                <LocalizedClientLink
                  key={c.id}
                  href={`/categories/${c.handle}`}
                  className="hover:text-neutral-900 transition-colors py-0.5"
                >
                  {c.name}
                </LocalizedClientLink>
              ))}
            </div>
          )}

          {/* Collections */}
          {collections && collections.length > 0 && (
            <div className="flex flex-col gap-y-2 text-xs">
              <span className="font-semibold text-neutral-900 text-sm mb-1">
                Collections
              </span>
              {collections.slice(0, 5).map((c) => (
                <LocalizedClientLink
                  key={c.id}
                  href={`/collections/${c.handle}`}
                  className="hover:text-neutral-900 transition-colors py-0.5"
                >
                  {c.title}
                </LocalizedClientLink>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM SINGLE LINE */}
        <div className="border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
          Powered by{" "}
          <a
            href="https://deducia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-800 hover:underline"
          >
            Deducia Inc.
          </a>
        </div>
      </div>
    </footer>
  )
}
