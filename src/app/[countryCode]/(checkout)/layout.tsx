import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      {/* TOP STRIP */}
      <div className="bg-neutral-950 text-white text-xs py-2 px-4 border-b border-neutral-800">
        <div className="content-container flex items-center justify-between mx-auto">
          <span className="text-neutral-400 text-xs hidden sm:inline">
            Secure Checkout
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

      <div className="h-16 bg-white border-b">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:inline txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase font-bold tracking-wider"
            data-testid="store-link"
          >
            Marketplace
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
      <div className="py-4 w-full flex items-center justify-center border-t text-xs text-neutral-500">
        Powered by{" "}
        <a
          href="https://deducia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-neutral-700 hover:underline font-medium"
        >
          Deducia Inc.
        </a>
      </div>
    </div>
  )
}
