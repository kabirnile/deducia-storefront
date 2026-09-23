import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Customer Service | Marketplace",
  description: "Customer support, order tracking, returns, and FAQs.",
}

export default function CustomerServicePage() {
  return (
    <div className="content-container py-12 max-w-4xl mx-auto">
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Customer Service & Support
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          We're here to help. Reach out with any inquiries regarding orders, deliveries, or vendor partnerships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50">
          <h3 className="font-semibold text-sm text-neutral-900 mb-2">
            Email Support
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Response typically within 24 hours
          </p>
          <a
            href="mailto:support@deducia.com"
            className="text-xs font-semibold text-neutral-900 hover:underline"
          >
            support@deducia.com →
          </a>
        </div>

        <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50">
          <h3 className="font-semibold text-sm text-neutral-900 mb-2">
            Order Inquiries
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Track active shipments and delivery status
          </p>
          <LocalizedClientLink
            href="/account"
            className="text-xs font-semibold text-neutral-900 hover:underline"
          >
            Go to Account Orders →
          </LocalizedClientLink>
        </div>

        <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50">
          <h3 className="font-semibold text-sm text-neutral-900 mb-2">
            Merchant Inquiries
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Register and manage your vendor shop
          </p>
          <a
            href="https://api.nearsy.store/seller/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-neutral-900 hover:underline"
          >
            Open Merchant Portal →
          </a>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">
          Frequently Asked Questions
        </h2>

        <div className="border border-neutral-200 rounded-lg p-5">
          <h4 className="font-semibold text-sm text-neutral-800 mb-1">
            How does delivery work on Marketplace?
          </h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            All orders are fulfilled by independent verified sellers and dispatched via Standard or Express courier services. You can select your preferred shipping rate during checkout.
          </p>
        </div>

        <div className="border border-neutral-200 rounded-lg p-5">
          <h4 className="font-semibold text-sm text-neutral-800 mb-1">
            What is the return and refund policy?
          </h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Unused items in original packaging are eligible for return within 30 days of delivery. Contact customer support with your Order ID to initiate a return.
          </p>
        </div>

        <div className="border border-neutral-200 rounded-lg p-5">
          <h4 className="font-semibold text-sm text-neutral-800 mb-1">
            How can I start selling on Marketplace?
          </h4>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Click the "Sell" button in the top bar or footer to access the Seller Portal, submit your store credentials, and upload your product catalog.
          </p>
        </div>
      </div>
    </div>
  )
}
