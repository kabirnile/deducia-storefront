import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "@modules/layout/components/search-bar"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* 1. TOP STRIP */}
      <div className="bg-neutral-950 text-white text-xs py-2 px-4 border-b border-neutral-800">
        <div className="content-container flex items-center justify-between mx-auto">
          <span className="text-neutral-400 text-xs hidden sm:inline">
            Hyperlocal Delivery & Verified Independent Sellers
          </span>
          <div className="flex items-center gap-x-3 ml-auto">
            <a
              href="https://api.nearsy.store/seller/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-neutral-900 text-white border border-neutral-700 px-4 py-1 rounded-md text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              Sell
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base shadow-sm">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase font-bold tracking-wider text-neutral-900"
              data-testid="nav-store-link"
            >
              Marketplace
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>

      {/* 3. UNIVERSAL SEARCH BAR STRIP */}
      <div className="bg-white border-b border-neutral-200 py-2.5 px-4">
        <div className="content-container mx-auto">
          <SearchBar />
        </div>
      </div>
    </div>
  )
}
