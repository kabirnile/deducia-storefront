"use client"

import { Popover, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  "Customer Service": "/customer-service",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="flex items-center h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base font-medium text-neutral-800"
                >
                  Menu
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Overlay className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50" />
              </Transition>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Popover.Panel className="flex flex-col fixed w-full sm:w-[380px] h-screen z-50 bg-white text-neutral-900 border-r border-neutral-200 p-6 justify-between shadow-2xl">
                  <div>
                    <div className="flex justify-between items-center pb-6 border-b border-neutral-100">
                      <span className="text-base font-bold tracking-wider uppercase text-neutral-900">
                        Deducia
                      </span>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                      >
                        <XMark />
                      </button>
                    </div>

                    <ul className="flex flex-col gap-4 items-start pt-6">
                      {Object.entries(SideMenuItems).map(([name, href]) => (
                        <li key={name} className="w-full">
                          <LocalizedClientLink
                            href={href}
                            className="text-xl font-semibold leading-10 hover:text-emerald-600 transition-colors block"
                            onClick={close}
                            data-testid={`${name.toLowerCase()}-link`}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                      <li className="w-full pt-2">
                        <a
                          href="https://api.nearsy.store/seller/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-black text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
                        >
                          Seller Portal →
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-y-4 pt-6 border-t border-neutral-100">
                    <div
                      className="flex justify-between"
                      onMouseEnter={toggleState.open}
                      onMouseLeave={toggleState.close}
                    >
                      {regions && (
                        <CountrySelect
                          toggleState={toggleState}
                          regions={regions}
                        />
                      )}
                      <ArrowRightMini
                        className={clx(
                          "transition-transform duration-150",
                          toggleState.state ? "-rotate-90" : ""
                        )}
                      />
                    </div>
                    <Text className="flex justify-between txt-compact-small text-neutral-500 text-xs">
                      © {new Date().getFullYear()} Deducia. All rights reserved.
                    </Text>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
