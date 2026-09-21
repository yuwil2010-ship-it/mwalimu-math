"use client"
import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Check, Download, ArrowLeft, MessageCircle, Loader2 } from "lucide-react"

function ThankYouContent() {
  const params = useSearchParams()
  const topic = params.get("topic") || "Algebraic Expressions"
  const form = params.get("form") || "Form II"
  const ref = params.get("reference") || "REF-2025-8392"
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    // Tunatumia anchor badala ya window.location.href ili kuepuka ESLint error
    const link = document.createElement("a")
    link.href = `/api/download/${ref}`
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setIsDownloading(false), 3000)
  }

  const handleWhatsApp = () => {
    const msg = `Habari Mwalimu Math, nimelipia ${form} - ${topic} Ref: ${ref}. Naomba link ya kupakua.`
    window.open(`https://wa.me/255XXXXXXXXX?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-[#0a1931] flex flex-col">
      <header className="max-w-5xl mx-auto w-full px-4 py-4 flex justify-between items-center">
        <h1 className="text-white font-black text-lg">MWALIMU <span className="text-[#d4af37]">MATH</span></h1>
        <Link href="/notes" className="text-xs text-white/70 border border-white/20 px-3 py-1.5 rounded-full">Back to Notes</Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded- w-full max-w-md p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-white" size={32} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black text-gray-900">Asante! Malipo Yamefanikiwa!</h1>
          <p className="text-sm text-gray-500 mt-2">Notes zako ziko tayari kupakuliwa</p>
          <div className="bg-gray-50 rounded-xl p-4 mt-6 text-left text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Form:</span><span className="font-bold">{form}</span></div>
            <div className="flex justify-between mt-2"><span className="text-gray-500">Topic:</span><span className="font-bold">{topic}</span></div>
            <div className="flex justify-between mt-2"><span className="text-gray-500">Bei:</span><span className="font-bold text-[#0a1931]">TZS 1,000/=</span></div>
            <div className="flex justify-between mt-2"><span className="text-gray-500">Ref:</span><span className="font-bold text-xs">{ref}</span></div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full mt-6 bg-[#d4af37] text-[#0a1931] font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#c19b2e] disabled:opacity-70"
          >
            {isDownloading? <Loader2 size={18} className="animate-spin"/> : <Download size={18}/>}
            {isDownloading? "Inapakua..." : "Pakua PDF Sasa"}
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full mt-3 bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700"
          >
            <MessageCircle size={18}/> Tuma WhatsApp
          </button>

          <Link href="/notes" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 mt-6">
            <ArrowLeft size={14}/> Rudi kwenye Notes
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1931] flex items-center justify-center text-white">Inapakia...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}