"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { CartSidebar } from "@/components/cart-sidebar"
import { Button } from "@/components/ui/button"
import { tarifsLivraison, communesParWilaya, bureauxNoest, BureauNoest, wilayaNames } from "@/lib/geo"

// Build wilaya list dynamically from communesParWilaya keys for the select
const wilayas = Object.keys(communesParWilaya)
  .map((key) => Number(key))
  .sort((a, b) => a - b)

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [selectedWilayaId, setSelectedWilayaId] = useState<number | "">("")
  const [selectedCommune, setSelectedCommune] = useState("")
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<number>(1)
  const [selectedStopDeskCode, setSelectedStopDeskCode] = useState("")

  const subtotal = useMemo(() => Math.round(getTotalPrice()), [getTotalPrice])

  const availableCommunes = useMemo(() => {
    if (!selectedWilayaId) return []
    return communesParWilaya[selectedWilayaId] ?? []
  }, [selectedWilayaId])

  const availableBureaux: BureauNoest[] = useMemo(() => {
    if (!selectedWilayaId) return []
    const idStr = String(selectedWilayaId)
    return bureauxNoest.filter((bureau) => {
      const match = bureau.code.match(/^(\d+)/)
      return match && match[1] === idStr
    })
  }, [selectedWilayaId])

  const shipping = useMemo(() => {
    if (!selectedWilayaId) return 0
    const key = String(selectedWilayaId)
    const t = tarifsLivraison[key]
    if (!t) return 0
    return selectedDeliveryType === 2 ? t.stopDesk : t.domicile
  }, [selectedWilayaId, selectedDeliveryType])

  const total = subtotal + shipping

  const handleConfirmOrder = async () => {
    if (!lastName || !firstName || !phone || !address || !selectedWilayaId || !selectedCommune) {
      alert("يرجى ملء جميع الحقول المطلوبة.")
      return
    }

    const wilayaName = selectedWilayaId ? wilayaNames[selectedWilayaId] ?? String(selectedWilayaId) : ""
    const deliveryTypeLabel = selectedDeliveryType === 2 ? "agence" : "domicile"
    const totalLabel = `${total.toLocaleString("fr-DZ")} DA`

    const cartSummary =
      items.length === 0
        ? "Panier vide"
        : items
            .map(
              (item) =>
                `${item.name} x${item.quantity} - ${Math.round(item.price * item.quantity).toLocaleString("fr-DZ")} DA`,
            )
            .join(" | ")

    const formData = new URLSearchParams({
      // Résumé complet du panier
      "entry.1758731177": cartSummary,
      // Nom / Prénom
      "entry.1773261467": lastName,
      "entry.2110847750": firstName,
      // Téléphone
      "entry.100431033": phone,
      // Wilaya, Adresse, Commune
      "entry.1775619348": wilayaName,
      "entry.400694937": address,
      "entry.1470719156": selectedCommune,
      // Type de livraison
      "entry.37834111": deliveryTypeLabel,
      // Total
      "entry.1217057388": totalLabel,
    })

    try {
      await fetch(
        "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdSzR1SVpOMtpomDPrXDfu2DLoNJY4Hi-UAQAXsQkbycHRDEA/formResponse",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        },
      )

      clearCart()
      setShowSuccess(true)
    } catch (e) {
      console.error("Error submitting order to Google Form", e)
      alert("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.")
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur sticky top-0 z-40">
        <div className="px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight leading-none">
                Zym<span className="text-yellow-400">Power</span>
              </span>
              <span className="text-[10px] text-zinc-500 tracking-widest uppercase">
                Suppléments de Performance
              </span>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar />

      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => history.back()}
            className="text-zinc-600 hover:text-black cursor-pointer"
          >
         رجوع
          </button>
          <div className="font-semibold text-zinc-800">تأكيد الطلب</div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 relative">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4 md:p-6 space-y-8">
          {/* Personal info */}
          <section className="space-y-4 border-b border-zinc-200 pb-6">
            <h2 className="text-right font-semibold text-zinc-900">المعلومات الشخصية</h2>

            <div className="space-y-3">
              <div className="flex flex-col text-right">
                <label className="text-xs text-zinc-600 mb-1">اللقب *</label>
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder=""
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col text-right">
                <label className="text-xs text-zinc-600 mb-1">الإسم *</label>
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder=""
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col text-right">
                <label className="text-xs text-zinc-600 mb-1">رقم الهاتف *</label>
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="مثال: 78 56 34 12 06"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col text-right">
                <label className="text-xs text-zinc-600 mb-1">الولاية *</label>
                <select
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                  value={selectedWilayaId}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedWilayaId(value ? Number(value) : "")
                    setSelectedCommune("")
                    setSelectedStopDeskCode("")
                  }}
                >
                  <option value="">اختر ولايتك</option>
                  {wilayas.map((id) => (
                    <option key={id} value={id}>
                      {wilayaNames[id] ?? `Wilaya ${id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-right">
                <label className="text-xs text-zinc-600 mb-1">العنوان *</label>
                <input
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="مثال: 12 شارع الزهور"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col text-right">
                <label className="text-xs text-zinc-600 mb-1">البلدية *</label>
                <select
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                  value={selectedCommune}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                  disabled={!selectedWilayaId || availableCommunes.length === 0}
                >
                  {!selectedWilayaId && <option value="">يرجى اختيار ولاية أولاً</option>}
                  {selectedWilayaId && availableCommunes.length === 0 && (
                    <option value="">لا توجد بلديات متاحة لهذه الولاية</option>
                  )}
                  {availableCommunes.length > 0 && (
                    <>
                      <option value="">اختر بلدية</option>
                      {availableCommunes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* Delivery type */}
          <section className="space-y-4 border-b border-zinc-200 pb-6">
            <h2 className="text-right font-semibold text-zinc-900">نوع التوصيل</h2>
            <div className="space-y-3">
              <div className="flex flex-col text-right">
                <label className="text-xs text-zinc-600 mb-1">اختر نوع التوصيل *</label>
                <select
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-zinc-400"
                  value={selectedDeliveryType}
                  onChange={(e) => {
                    const id = Number(e.target.value) || 1
                    setSelectedDeliveryType(id)
                    if (id !== 2) setSelectedStopDeskCode("")
                  }}
                >
                  <option value={1}>التوصيل الى المنزل</option>
                  <option value={2}>الاستلام في الوكالة</option>
                </select>
              </div>

              {/* Stop-desk office selector removed */}
            </div>
          </section>

          {/* Cart summary */}
          <section className="space-y-4">
            <h2 className="text-right font-semibold text-zinc-900">تفاصيل طلبك</h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-zinc-200 rounded-xl bg-white shadow-sm px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 rounded-md border border-zinc-200 bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-right flex-1">
                      <div className="font-semibold text-sm text-zinc-900">{item.name}</div>
                      <div className="text-xs text-zinc-500">السعر: {Math.round(item.price).toLocaleString("fr-DZ")} DA</div>
                      <div className="text-xs text-zinc-500">الكمية: {item.quantity}</div>
                      <div className="text-xs font-semibold text-zinc-800">
                        المجموع: {Math.round(item.price * item.quantity).toLocaleString("fr-DZ")} DA
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <p className="text-center text-sm text-zinc-500">سلة المشتريات فارغة.</p>
              )}
            </div>

            <div className="border-t border-zinc-200 pt-4 space-y-1 text-right text-sm">
              <div>تكلفة التوصيل: {shipping.toLocaleString("fr-DZ")} DA</div>
              <div className="font-semibold">
                الإجمالي (مع التوصيل): {total.toLocaleString("fr-DZ")} DA
              </div>
            </div>

            <div className="pt-4">
              <Button
                className="w-full bg-black text-white hover:bg-zinc-900 cursor-pointer py-3 text-sm font-semibold"
                onClick={handleConfirmOrder}
              >
                تأكيد الطلب
              </Button>
            </div>
          </section>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-4 max-w-xs w-[90%] text-center md:max-w-sm md:px-6 md:py-5">
              <h2 className="text-lg font-semibold text-zinc-900 mb-2">تم إرسال طلبك بنجاح</h2>
              <p className="text-sm text-zinc-600 mb-4">سنقوم بالتواصل معك في أقرب وقت لتأكيد طلبك.</p>
              <Button
                className="w-full bg-black text-white hover:bg-zinc-900 cursor-pointer py-2 text-sm font-semibold"
                onClick={() => router.push("/")}
              >
                العودة إلى الصفحة الرئيسية
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
