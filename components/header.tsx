"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useEffect, useState } from "react"
import Image from "next/image"

export function Header() {
  const { toggleCart, getTotalItems, items } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalItems = mounted ? getTotalItems() : 0

  return (
    <header className="border-b border-zinc-800 bg-black/95 backdrop-blur sticky top-0 z-40">
      <div className="px-0 md:px-0">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-28 h-10 md:w-32 md:h-12">
              <Image
                src="/images/logo.png"
                alt="ZymPower Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] md:text-xs text-zinc-300 tracking-wide">
                Compléments alimentaires
              </span>
              <span className="text-[11px] md:text-xs text-zinc-400 tracking-wide">
                coaching &amp; conseils
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/#nos-categories"
              className="text-zinc-400 hover:text-yellow-400 transition-colors cursor-pointer"
            >
              Types
            </Link>
            <Link
              href="/products"
              className="text-zinc-400 hover:text-yellow-400 transition-colors cursor-pointer"
            >
              Produits
            </Link>
            <Link
              href="/category/packs"
              className="text-zinc-400 hover:text-yellow-400 transition-colors cursor-pointer"
            >
              Packs
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-yellow-400 relative cursor-pointer"
              onClick={toggleCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
