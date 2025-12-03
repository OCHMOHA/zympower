"use client"

import React, { useEffect, useRef, useState } from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Shield, Award, Truck, ChevronRight, Star } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { collection, query, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CartSidebar } from "@/components/cart-sidebar"
import { Header } from "@/components/header"
import { getCachedQuery } from "@/lib/firestore-cache"

export default function HomePage() {
  const { addItem, toggleCart } = useCartStore()
  const saleSliderRef = useRef<HTMLDivElement | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  type HomeProduct = {
    id: string
    name: string
    brand: string
    price: number
    image: string
    category: string
    rating: number
    reviews: number
    discount?: number
  }

  const handleAddToCart = (product: HomeProduct, e: React.MouseEvent) => {
    e.preventDefault()
    const qty = quantities[product.id] ?? 1
    for (let i = 0; i < qty; i++) {
      addItem(product)
    }
  }

  const [saleProducts, setSaleProducts] = useState<HomeProduct[]>([])
  const [newProducts, setNewProducts] = useState<HomeProduct[]>([])
  const [loadingHome, setLoadingHome] = useState(true)

  useEffect(() => {
    const loadHomepageProducts = async () => {
      setLoadingHome(true)
      try {
        const base = collection(db, "products")

        const saleDocs = await getCachedQuery<any[]>(
          "homepage-sale",
          query(base, where("onSale", "==", true), limit(12)),
        )
        const saleItems: HomeProduct[] = saleDocs.map((data: any) => ({
          id: String(data.id ?? data.slug ?? data.name),
          name: data.name,
          brand: data.brand ?? "",
          price: data.priceDa ?? 0,
          image: data.imageUrl ?? "/placeholder.svg",
          category: data.categorySlug ?? "",
          rating: data.rating ?? 0,
          reviews: data.reviews ?? 0,
          discount: data.discount ?? undefined,
        }))

        const newDocs = await getCachedQuery<any[]>(
          "homepage-new",
          query(base, where("isNew", "==", true), limit(12)),
        )
        const newItems: HomeProduct[] = newDocs.map((data: any) => ({
          id: String(data.id ?? data.slug ?? data.name),
          name: data.name,
          brand: data.brand ?? "",
          price: data.priceDa ?? 0,
          image: data.imageUrl ?? "/placeholder.svg",
          category: data.categorySlug ?? "",
          rating: data.rating ?? 0,
          reviews: data.reviews ?? 0,
        }))

        setSaleProducts(saleItems)
        setNewProducts(newItems)
      } catch (e) {
        console.error("Error loading homepage products", e)
      } finally {
        setLoadingHome(false)
      }
    }

    void loadHomepageProducts()
  }, [])

  const categories = [
    { label: "Packs", image: "/images/pack.webp" },
    { label: "Protéines", image: "/images/protien.jpg" },
    { label: "Créatines", image: "/images/creatine.jpg" },
    { label: "Mass Gainers", image: "/images/massgainer.jpg" },
    { label: "Pre-Workout", image: "/images/preworkout.jpg" },
    { label: "Vitamines", image: "/images/vitamine.jpg" },
    { label: "Brûleur de Graisse", image: "/images/bru.webp" },
    { label: "COLLAGENE", image: "/images/collagen.jpg" },
    { label: "Boosters", image: "/images/boosters.jpg" },
    { label: "Bars & Snacks", image: "/images/snacks.jpg" },
  ]

  const saleList = saleProducts
  const newList = newProducts

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartSidebar />

      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <img
          src="/images/herobg.jpg"
          alt="Zym Power Suppléments de Performance"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="hidden md:block text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Élevez Votre Performance</h1>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="mt-52 md:mt-0 bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer"
                onClick={() => {
                  const el = document.getElementById("produits-en-solde")
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                }}
              >
                Acheter Maintenant
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Nos Catégories - horizontal list under hero */}
      <section id="nos-categories" className="border-y border-zinc-800 bg-zinc-950">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">NOS CATÉGORIES</h2>
            <div className="hidden md:block h-px flex-1 bg-zinc-800" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
            {categories.map((category) => {
              const slug = category.label
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")

              return (
                <Link
                  key={category.label}
                  href={`/category/${slug}`}
                  className="min-w-[190px] max-w-[210px] cursor-pointer"
                >
                  <Card className="text-card-foreground flex flex-col gap-6 py-0 bg-black border border-zinc-800 hover:border-yellow-400 transition-all duration-300 group shadow-sm hover:shadow-lg overflow-hidden rounded-2xl h-full">
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="relative h-full w-full overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-white bg-black">
                        <span>{category.label}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-yellow-400 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Produits en Solde */}
      <section id="produits-en-solde" className="py-24 relative overflow-hidden bg-zinc-950/60">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex items-start gap-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide">
                PRODUITS EN SOLDE
              </h2>
            </div>
            <div className="space-y-3">
              <div className="h-px w-24 bg-yellow-400" />
              <p className="text-sm md:text-base text-zinc-400 max-w-xl text-pretty">
                Profitez de nos meilleures offres sur une sélection de produits de performance. Quantités limitées.
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              className="hidden md:flex absolute -left-4 top-1/2 z-20 h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white hover:bg-yellow-400 hover:text-black transition-colors"
              onClick={() => {
                if (saleSliderRef.current) {
                  saleSliderRef.current.scrollBy({ left: -300, behavior: "smooth" })
                }
              }}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>

            <div
              ref={saleSliderRef}
              className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:'none']"
            >
              {saleList.map((product, index) => {
                const discountPercent =
                  typeof (product as any).discount === "number" ? (product as any).discount : 15
                const originalPrice = product.price / (1 - discountPercent / 100)

                return (
                  <div
                    key={product.id}
                    className="group cursor-default min-w-[220px] max-w-[240px] flex-shrink-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="bg-white text-zinc-900 border border-zinc-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden h-full relative">
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative aspect-[16/11] bg-white overflow-hidden">
                          <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded text-[11px] font-semibold bg-red-500 text-white shadow">
                            -{discountPercent}%
                          </div>
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 px-3 py-2 space-y-2">
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                              {product.brand}
                            </span>
                            <h3 className="font-semibold text-xs md:text-sm leading-snug text-zinc-900 line-clamp-2">
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                              {product.category}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-zinc-500 line-through">
                                {Math.round(originalPrice).toLocaleString("fr-DZ")} DA
                              </span>
                              <span className="text-sm font-extrabold text-red-500">
                                {Math.round(product.price).toLocaleString("fr-DZ")} DA
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                              Disponible
                            </span>
                          </div>
                        </div>

                        <div className="px-3 pb-3 pt-1.5 space-y-1.5">
                          <Button
                            className="w-full bg-black text-white hover:bg-zinc-900 text-[11px] md:text-xs font-semibold tracking-wide py-2 cursor-pointer"
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            AJOUTER AU PANIER
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full border-zinc-300 text-[11px] md:text-xs font-semibold tracking-wide hover:bg-zinc-100 text-black py-2 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault()
                              handleAddToCart(product, e)
                              toggleCart()
                            }}
                          >
                            ACHETER MAINTENANT
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              className="hidden md:flex absolute -right-4 top-1/2 z-20 h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-black/70 text-white hover:bg-yellow-400 hover:text-black transition-colors"
              onClick={() => {
                if (saleSliderRef.current) {
                  saleSliderRef.current.scrollBy({ left: 300, behavior: "smooth" })
                }
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
              NOUVEAUTÉS
            </h2>
            <div className="hidden md:block h-px flex-1 bg-zinc-800" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {newList.map((product) => (
              <div key={`new-${product.id}`} className="group cursor-default">
                <Card className="bg-white text-zinc-900 border border-zinc-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden h-full">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative aspect-[10/5] bg-white overflow-hidden flex items-center justify-center">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 px-4 py-2 space-y-2">
                      {/* Product name */}
                      <h3 className="font-semibold text-xs md:text-sm leading-snug text-zinc-900 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div>
                        <span className="text-lg font-extrabold text-zinc-900">
                          {Math.round(product.price).toLocaleString("fr-DZ")} DA
                        </span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="h-7 w-7 rounded border border-zinc-300 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 text-xs"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setQuantities((prev) => {
                                const current = prev[product.id] ?? 1
                                const next = Math.max(1, current - 1)
                                return { ...prev, [product.id]: next }
                              })
                            }}
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold text-zinc-900 min-w-[1.25rem] text-center">
                            {quantities[product.id] ?? 1}
                          </span>
                          <button
                            type="button"
                            className="h-7 w-7 rounded border border-zinc-300 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 text-xs"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setQuantities((prev) => {
                                const current = prev[product.id] ?? 1
                                const next = Math.min(99, current + 1)
                                return { ...prev, [product.id]: next }
                              })
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="pt-2 space-y-2">
                        <Button
                          className="w-full bg-black text-white hover:bg-zinc-900 text-[10px] md:text-xs font-semibold tracking-wide py-2 leading-snug cursor-pointer"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2 shrink-0" />
                          <span className="whitespace-normal text-center">AJOUTER AU PANIER</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-zinc-300 text-[10px] md:text-xs font-semibold tracking-wide hover:bg-zinc-100 text-black py-2 leading-snug cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(product, e)
                            toggleCart()
                          }}
                        >
                          <span className="whitespace-normal text-center w-full">ACHETER MAINTENANT</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-block text-sm font-semibold text-white border border-zinc-700 px-6 py-2 rounded-full hover:border-yellow-400 hover:text-yellow-400 transition-colors cursor-pointer"
            >
              Tous les Produits
            </Link>
          </div>
        </div>
      </section>

      
      {/* Stats bar */}
      <section className="bg-black pb-20">
        <div className="container mx-auto px-4">
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
              <div className="text-4xl font-bold text-yellow-400">50K+</div>
              <div className="text-sm text-zinc-400">Clients Satisfaits</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
              <div className="text-4xl font-bold text-yellow-400">99.9%</div>
              <div className="text-sm text-zinc-400">Pureté Garantie</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
              <div className="text-4xl font-bold text-yellow-400">24/7</div>
              <div className="text-sm text-zinc-400">Support Client</div>
            </div>
            <div className="text-center space-y-2 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
              <div className="text-4xl font-bold text-yellow-400">100%</div>
              <div className="text-sm text-zinc-400">Testé en Laboratoire</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">CONTACT</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a href="tel:0561063005" className="hover:text-yellow-400 cursor-pointer flex items-center gap-2">
                    <span className="text-lg">📞</span>
                    <span>0561 06 30 05</span>
                  </a>
                </li>
                <li>
                  <a href="tel:0550156671" className="hover:text-yellow-400 cursor-pointer flex items-center gap-2">
                    <span className="text-lg">📞</span>
                    <span>0550 15 66 71</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Shop location */}
            <div>
              <h4 className="font-semibold text-white mb-4">NOTRE MAGASIN</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a
                    href="https://maps.app.goo.gl/vrbNLkSFeEKKHwgJ7?g_st=ipc"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-yellow-400 cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-lg">📍</span>
                    <span>Zym Power Cheraga, Alger</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h4 className="font-semibold text-white mb-4">SUIVEZ-NOUS</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a
                    href="https://www.instagram.com/zym_power_cheraga?igsh=bmhxZWlqZ29kcHk="
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-yellow-400 cursor-pointer flex items-center gap-2"
                  >
                    <img src="/images/instagram.png" alt="Instagram" className="w-5 h-5" />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/share/1F8Cmt56wZ/?mibextid=LQQJ4d"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-yellow-400 cursor-pointer flex items-center gap-2"
                  >
                    <img src="/images/facebook.png" alt="Facebook" className="w-5 h-5" />
                    <span>Facebook</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-400">
            <p>&copy; 2025 ZymPower. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
