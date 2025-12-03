"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { collection, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore"

import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase-auth"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { getCachedQuery, invalidateCacheKey } from "@/lib/firestore-cache"
import { Header } from "@/components/header"
import { CartSidebar } from "@/components/cart-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  slug?: string
  categorySlug?: string
  priceDa?: number
  brand?: string
  imageUrl?: string
  discount?: number
  onSale?: boolean
  isNew?: boolean
  isPack?: boolean
}

const emptyForm: Omit<Product, "id"> = {
  name: "",
  slug: "",
  categorySlug: "",
  priceDa: undefined,
  brand: "",
  imageUrl: "",
  discount: 0,
  onSale: false,
  isNew: false,
  isPack: false,
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Omit<Product, "id">>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login")
      } else {
        setAuthChecked(true)
      }
    })
    return () => unsub()
  }, [router])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const items = await getCachedQuery<Product[]>("products", collection(db, "products"))
      setProducts(items)
    } catch (err) {
      console.error("Error loading products", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authChecked) return
    void loadProducts()
  }, [authChecked])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: (form.slug || form.name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        categorySlug: form.categorySlug?.trim().toLowerCase() || "",
        priceDa: form.priceDa ?? 0,
        brand: form.brand?.trim() || "",
        imageUrl: form.imageUrl?.trim() || "",
        discount: form.discount ?? 0,
        onSale: form.onSale ?? false,
        isNew: form.isNew ?? false,
        isPack: form.isPack ?? false,
      }

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload)
      } else {
        await addDoc(collection(db, "products"), payload)
      }

      invalidateCacheKey("products")
      await loadProducts()
      resetForm()
    } catch (err) {
      console.error("Error saving product", err)
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      slug: p.slug,
      categorySlug: p.categorySlug,
      priceDa: p.priceDa,
      brand: p.brand,
      imageUrl: p.imageUrl,
      discount: p.discount ?? 0,
      onSale: p.onSale ?? false,
      isNew: p.isNew ?? false,
      isPack: p.isPack ?? false,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return
    try {
      await deleteDoc(doc(db, "products", id))
      invalidateCacheKey("products")
      await loadProducts()
    } catch (err) {
      console.error("Error deleting product", err)
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm text-zinc-400">Vérification de l&apos;authentification...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <CartSidebar />

      <main className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">Gestion des produits</h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">
              Ajouter, modifier ou supprimer les produits de votre boutique.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs cursor-pointer"
              onClick={async () => {
                await signOut(auth)
                router.replace("/login")
              }}
            >
              Se déconnecter
            </Button>
          </div>
        </div>

        {/* Formulaire d'ajout / édition */}
        <Card className="bg-zinc-950 border-zinc-800 p-4 space-y-4">
          <form className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Nom du produit</label>
              <input
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Catégorie</label>
              <select
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={form.categorySlug ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="packs">Packs</option>
                <option value="proteines">Protéines</option>
                <option value="creatines">Créatines</option>
                <option value="mass-gainers">Mass Gainers</option>
                <option value="pre-workout">Pre-Workout</option>
                <option value="vitamines">Vitamines</option>
                <option value="bruleur-de-graisse">Brûleur de Graisse</option>
                <option value="collagene">Collagène</option>
                <option value="boosters">Boosters</option>
                <option value="bars-snacks">Bars & Snacks</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Prix (DA)</label>
              <input
                type="number"
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={form.priceDa ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceDa: e.target.value ? Number(e.target.value) : undefined }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Pack ?</label>
              <select
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={form.isPack ? "true" : "false"}
                onChange={(e) => setForm((f) => ({ ...f, isPack: e.target.value === "true" }))}
              >
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-zinc-400">URL de l&apos;image</label>
              <input
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                placeholder="https://... ou /images/mon-produit.jpg"
                value={form.imageUrl ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Remise (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={form.discount ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discount: e.target.value ? Number(e.target.value) : 0 }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">En solde ?</label>
              <select
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={form.onSale ? "true" : "false"}
                onChange={(e) => setForm((f) => ({ ...f, onSale: e.target.value === "true" }))}
              >
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Nouveauté ?</label>
              <select
                className="w-full rounded-md bg-black border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                value={form.isNew ? "true" : "false"}
                onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.value === "true" }))}
              >
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </div>
            <div className="flex gap-2 md:col-span-1">
              <Button
                type="submit"
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer"
                disabled={saving}
              >
                {editingId ? "Mettre à jour" : "Ajouter"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-500 text-zinc-200 hover:bg-zinc-900"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </Card>

        {loading ? (
          <p className="text-sm text-zinc-400">Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-zinc-400">Aucun produit trouvé dans Firestore.</p>
        ) : (
          <div className="overflow-x-auto border border-zinc-800 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-900/80 text-zinc-300">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Image</th>
                  <th className="px-4 py-3 text-left font-medium">Nom</th>
                  <th className="px-4 py-3 text-left font-medium">Catégorie</th>
                  <th className="px-4 py-3 text-left font-medium">Prix (DA)</th>
                  <th className="px-4 py-3 text-left font-medium">Remise (%)</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/70">
                    <td className="px-4 py-3">
                      {p.imageUrl ? (
                        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-zinc-900">
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-500">
                          Aucune
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{p.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{p.categorySlug ?? "-"}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {p.priceDa != null ? p.priceDa.toLocaleString("fr-DZ") : "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{p.discount != null ? `${p.discount}%` : "-"}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-zinc-500 text-xs px-2 py-1 h-7 cursor-pointer"
                          onClick={() => handleEditClick(p)}
                        >
                          Modifier
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="text-xs px-2 py-1 h-7 cursor-pointer"
                          onClick={() => handleDelete(p.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
