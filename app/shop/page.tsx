"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Star } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { CartSidebar } from "@/components/cart-sidebar"
import { Header } from "@/components/header"

export default function ShopPage() {
  const { addItem, toggleCart } = useCartStore()
  const products = [
    {
      id: "1",
      name: "Protéine + Collagène",
      brand: "Tropeaka",
      price: 49.99,
      image: "/images/protein-20-2b-20collagen.jpg",
      badge: "Meilleure Vente",
      category: "Protéine",
      rating: 4.8,
      reviews: 234,
    },
    {
      id: "2",
      name: "Transform 1.0",
      brand: "Tranont Labs",
      price: 39.99,
      image: "/images/photo-2025-10-23-16-27-18.jpg",
      badge: "Nouveau",
      category: "Enzymes",
      rating: 4.9,
      reviews: 89,
    },
    {
      id: "3",
      name: "Créatine Pure",
      brand: "Dark Lab",
      price: 34.99,
      image: "/images/photo-2025-10-23-16-26-50.jpg",
      category: "Créatine",
      rating: 4.7,
      reviews: 456,
    },
    {
      id: "4",
      name: "L-Théanine Puissance Double",
      brand: "Sports Research",
      price: 24.99,
      image: "/images/photo-2025-10-23-16-26-56.jpg",
      category: "Concentration",
      rating: 4.6,
      reviews: 178,
    },
    {
      id: "5",
      name: "Vitamine D3 Puissance Extra",
      brand: "Sports Research",
      price: 19.99,
      image: "/images/photo-2025-10-23-16-27-16.jpg",
      badge: "Populaire",
      category: "Vitamines",
      rating: 4.9,
      reviews: 567,
    },
    {
      id: "6",
      name: "Monohydrate de Créatine",
      brand: "Sports Research",
      price: 29.99,
      image: "/images/photo-2025-10-23-16-26-53.jpg",
      category: "Créatine",
      rating: 4.8,
      reviews: 389,
    },
    {
      id: "7",
      name: "Peptides de Collagène Hydrolysés",
      brand: "Zammex",
      price: 44.99,
      image: "/images/photo-2025-10-23-16-27-22.jpg",
      badge: "Nourri à l'Herbe",
      category: "Collagène",
      rating: 4.7,
      reviews: 234,
    },
    {
      id: "8",
      name: "Booster de Testostérone",
      brand: "Habumama",
      price: 54.99,
      image: "/images/photo-2025-10-23-16-26-47.jpg",
      category: "Hormones",
      rating: 4.5,
      reviews: 145,
    },
  ]

  const handleAddToCart = (product: (typeof products)[0], e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)

    // Open cart sidebar after adding item
    setTimeout(() => {
      toggleCart()
    }, 300)
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <CartSidebar />

      {/* Page Header */}
      <section className="bg-zinc-950 border-b border-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-2">Tous les Produits</h1>
          <p className="text-zinc-400">Parcourez notre collection complète de suppléments premium</p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                placeholder="Rechercher des produits..."
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
            <Select defaultValue="featured">
              <SelectTrigger className="w-full md:w-[200px] bg-zinc-900 border-zinc-800 text-white cursor-pointer">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="featured">Mis en avant</SelectItem>
                <SelectItem value="price-low">Prix: Faible au Élevé</SelectItem>
                <SelectItem value="price-high">Prix: Élevé au Faible</SelectItem>
                <SelectItem value="rating">Meilleures Notes</SelectItem>
                <SelectItem value="newest">Le Plus Nouveau</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="border-zinc-800 text-white hover:bg-zinc-900 bg-transparent cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="cursor-pointer">
                <Card className="bg-zinc-900 border-zinc-800 hover:border-yellow-400 transition-all duration-300 group overflow-hidden h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                      {product.badge && (
                        <Badge className="absolute top-3 left-3 z-10 bg-yellow-400 text-black">{product.badge}</Badge>
                      )}
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-yellow-400 mb-1">{product.brand}</div>
                      <h3 className="font-semibold text-white mb-2 text-pretty line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-zinc-400">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">${product.price}</span>
                        <Button
                          size="sm"
                          className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-xl">Z</span>
                </div>
                <span className="text-xl font-bold text-white">ZymPower</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Suppléments de recherche premium et suppléments pour la performance maximale.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Boutique</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/shop" className="hover:text-yellow-400 cursor-pointer">
                    Tous les Produits
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-yellow-400 cursor-pointer">
                    Catégories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/contact" className="hover:text-yellow-400 cursor-pointer">
                    Nous Contacter
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-yellow-400 cursor-pointer">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/quality" className="hover:text-yellow-400 cursor-pointer">
                    Assurance Qualité
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-yellow-400 cursor-pointer">
                    Blog
                  </Link>
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
