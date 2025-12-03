"use client"

import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function CartSidebar() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getTotalPrice } = useCartStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={toggleCart} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-zinc-950 border-l border-zinc-800 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Panier</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-zinc-700 mb-4" />
                <p className="text-zinc-400 mb-2">Votre panier est vide</p>
                <p className="text-sm text-zinc-500">Ajoutez des produits pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-zinc-950"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm mb-1 truncate">{item.name}</h3>
                      <p className="text-xs text-yellow-400 mb-2">{item.brand}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-zinc-800 rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white hover:text-yellow-400 cursor-pointer"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white hover:text-yellow-400 cursor-pointer"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">
                            {Math.round(item.price * item.quantity).toLocaleString("fr-DZ")} DA
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-zinc-500 hover:text-red-400 cursor-pointer"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="text-zinc-400">Sous-total</span>
                <span className="font-bold text-white">
                  {Math.round(getTotalPrice()).toLocaleString("fr-DZ")} DA
                </span>
              </div>
              <Button
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer"
                size="lg"
                onClick={() => {
                  toggleCart()
                  router.push("/checkout")
                }}
              >
                Passer la commande
              </Button>
              <Button
                variant="outline"
                className="w-full border-zinc-800 text-white bg-transparent hover:bg-transparent hover:text-white cursor-pointer"
                onClick={toggleCart}
              >
                Continuer vos achats
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
