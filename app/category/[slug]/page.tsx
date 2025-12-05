"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { CartSidebar } from "@/components/cart-sidebar"

const categoryLabels: Record<string, string> = {
  packs: "Packs",
  proteines: "Protéines",
  creatines: "Créatines",
  "mass-gainers": "Mass Gainers",
  "pre-workout": "Pre-Workout",
  vitamines: "Vitamines",
  "bruleur-de-graisse": "Brûleur de Graisse",
  collagene: "COLLAGENE",
  boosters: "Boosters",
  "bars-snacks": "Bars & Snacks",
}

export default function CategoryPage() {
  const params = useParams()
  const slug = (params?.slug as string) || ""
  const { addItem, toggleCart } = useCartStore()
  const [products, setProducts] = useState<
    Array<{
      id: string
      name: string
      brand?: string
      priceDa?: number
      imageUrl?: string
      categorySlug?: string
    }>
  >([])
  const [loading, setLoading] = useState(true)

  const label = categoryLabels[slug] ?? slug

  useEffect(() => {
    if (!slug) return

    const load = async () => {
      try {
        // Load all products and filter client-side to be robust to field name issues
        const snap = await getDocs(collection(db, "products"))
        const items: typeof products = []
        snap.forEach((doc) => {
          const data = doc.data() as any

          const docCategory = (data.categorySlug ?? data.categorySLug ?? "")
            .toString()
            .trim()
            .toLowerCase()

          if (docCategory === slug.toLowerCase()) {
            items.push({
              id: doc.id,
              name: data.name,
              brand: data.brand,
              priceDa: data.priceDa,
              imageUrl: data.imageUrl,
              // Normalised category slug for the UI model
              categorySlug: docCategory,
            })
          }
        })
        setProducts(items)
      } catch (e) {
        console.error("Error loading products for category", slug, e)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  const addProductToCart = (product: (typeof products)[0]) => {
    // Cart store currently expects a product shape from homepage; for now, push minimal info.
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand ?? "",
      price: (product.priceDa ?? 0) / 1, // stored as DA already
      image: product.imageUrl ?? "/placeholder.svg",
      category: product.categorySlug ?? "",
      rating: 0,
      reviews: 0,
    } as any)
  }

  const handleBuyNow = (product: (typeof products)[0]) => {
    addProductToCart(product)
    toggleCart()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <CartSidebar />
      <div className="bg-black/95">
        <div className="container mx-auto px-4 py-6">
          <div className="inline-block">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">{label}</h1>
            <div className="h-px bg-yellow-400 mt-2 w-full" />
          </div>
          <p className="text-xs md:text-sm text-zinc-400 mt-3">
            {products.length} résultat{products.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Products */}
        <section>
          {loading ? (
            <p className="text-sm text-zinc-400">Chargement des produits...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Aucun produit trouvé pour cette catégorie pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white text-zinc-900 border border-zinc-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden h-full"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative aspect-[16/11] bg-white overflow-hidden flex items-center justify-center">
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 px-3 py-2 space-y-2">
                      <h3 className="font-semibold text-xs md:text-sm leading-snug text-zinc-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <div>
                        <span className="text-sm font-extrabold text-zinc-900">
                          {product.priceDa != null ? product.priceDa.toLocaleString("fr-DZ") : "-"} DA
                        </span>
                      </div>
                    </div>
                    <div className="px-3 pb-3 pt-1.5 space-y-2">
                      <Button
                        className="w-full bg-black text-white hover:bg-zinc-900 text-[11px] md:text-xs font-semibold tracking-wide py-2 cursor-pointer"
                        onClick={() => addProductToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-zinc-800 text-black hover:bg-zinc-100 text-[11px] md:text-xs font-semibold tracking-wide py-2 cursor-pointer"
                        onClick={() => handleBuyNow(product)}
                      >
                        Acheter maintenant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
