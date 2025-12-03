"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Header } from "@/components/header"
import { CartSidebar } from "@/components/cart-sidebar"
import { db } from "@/lib/firebase"
import { useCartStore } from "@/lib/cart-store"

export default function AllProductsPage() {
  const { addItem } = useCartStore()
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

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "products"))
        const items: typeof products = []
        snap.forEach((doc) => {
          const data = doc.data() as any
          items.push({
            id: doc.id,
            name: data.name,
            brand: data.brand,
            priceDa: data.priceDa,
            imageUrl: data.imageUrl,
            categorySlug: (data.categorySlug ?? data.categorySLug ?? "").toString().trim().toLowerCase(),
          })
        })
        setProducts(items)
      } catch (e) {
        console.error("Error loading all products", e)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const handleAdd = (product: (typeof products)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand ?? "",
      price: (product.priceDa ?? 0) / 1,
      image: product.imageUrl ?? "/placeholder.svg",
      category: product.categorySlug ?? "",
      rating: 0,
      reviews: 0,
    } as any)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <CartSidebar />

      <div className="bg-black/95">
        <div className="container mx-auto px-4 py-6">
          <div className="inline-block">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">Tous les Produits</h1>
            <div className="h-px bg-yellow-400 mt-2 w-full" />
          </div>
          <p className="text-xs md:text-sm text-zinc-400 mt-3">
            {products.length} produit{products.length > 1 ? "s" : ""} disponibles
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-sm text-zinc-400">Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-zinc-400">Aucun produit disponible pour le moment.</p>
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
                    {product.brand && (
                      <p className="text-[11px] text-zinc-500">{product.brand}</p>
                    )}
                  </div>
                  <div className="px-3 pb-3 pt-1.5 space-y-2">
                    <Button
                      className="w-full bg-black text-white hover:bg-zinc-900 text-[11px] md:text-xs font-semibold tracking-wide py-2 cursor-pointer"
                      onClick={() => handleAdd(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ajouter au panier
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-zinc-800 text-black hover:bg-zinc-100 text-[11px] md:text-xs font-semibold tracking-wide py-2 cursor-pointer"
                      onClick={() => handleAdd(product)}
                    >
                      Acheter maintenant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
