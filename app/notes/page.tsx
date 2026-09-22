"use client"
import { Suspense, useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, Smartphone, Calculator, ArrowLeft, Globe, MessageCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { validatePaymentForm, normalizeTZPhone } from "@/lib/validation"

const syllabus: Record<string, string[]> = {
  "Form I": ["Concepts of Mathematics","Numbers I","Fractions","Decimals and Percentages","Metric Units","Approximations","Introduction to Geometry","Algebra","Numbers II","Ratio, Profit and Loss","Coordinate Geometry","Perimeters and Areas"],
  "Form II": ["Exponents and Radicals","Algebra","Quadratic Equations","Logarithms","Congruence","Similarity","Geometrical Transformation","Pythagoras Theorem","Trigonometry","Sets","Statistics"],
  "Form III": ["Relations","Functions","Statistics","Rates and Variations","Sequences and Series","Circles","Earth as a Sphere","Accounting"],
  "Form IV": ["Coordinate Geometry","Areas and Perimeters","Three Dimensional Figures","Probability","Trigonometry","Vectors","Matrices and Transformation","Linear Programming"],
  "Form V": ["Sets","Logic","Coordinate Geometry","Functions","Algebra","Trigonometry","Linear Programming","Differentiation","Integration"],
  "Form VI": ["Coordinate Geometry II","Vectors","Hyperbolic Functions","Statistics","Probability","Complex Numbers","Differential Equations","Numerical Methods"],
  "Mazoezi": [],
  "Bonus": []
}
const mazoeziByForm: Record<string, string[]> = {
  "Form I": syllabus["Form I"], "Form II": syllabus["Form II"], "Form III": syllabus["Form III"],
  "Form IV": syllabus["Form IV"], "Form V": syllabus["Form V"], "Form VI": syllabus["Form VI"],
}
const bonusForms = ["Form II NECTA", "Form IV NECTA", "Form VI NECTA"]
const currentYear = new Date().getFullYear()
const nectaYears = Array.from({ length: 5 }, (_, i) => `Necta ${currentYear - i}`)

const translations = {
  sw: { rudi: "Rudi Nyumbani", title: "Chagua Topic Unayohitaji", muhtasari: "Muhtasari wa Malipo", empty: "Hujachagua topic bado.", jumla: "Jumla:", chaguaMtandao: "Chagua Mtandao", simuMalipo: "Namba ya Simu ya Malipo", whatsappLabel: "Namba ya WhatsApp ya Kupokea PDF", whatsappNote: "Utapokea PDF kwenye WhatsApp mara baada ya malipo kuthibitishwa", ipo: "Ipo", haijapakiwa: "Haijapakiwa" },
  en: { rudi: "Back Home", title: "Choose Topic You Need", muhtasari: "Payment Summary", empty: "No topic selected yet.", jumla: "Total:", chaguaMtandao: "Choose Network", simuMalipo: "Payment Phone Number", whatsappLabel: "WhatsApp Number to Receive PDF", whatsappNote: "You will receive PDF on WhatsApp after payment is confirmed", ipo: "Available", haijapakiwa: "Not Uploaded" }
}

function NotesContent() {
  const searchParams = useSearchParams()
  const initialForm = searchParams.get("form") || "Form I"
  const [activeForm, setActiveForm] = useState(initialForm)
  const [mazoeziForm, setMazoeziForm] = useState("Form I")
  const [bonusForm, setBonusForm] = useState("Form II NECTA")
  const [selected, setSelected] = useState<string[]>([])
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [method, setMethod] = useState("M-Pesa")
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const tr = translations[lang]

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoadingTopics(true)
      const { data, error } = await supabase.from('topics_catalog').select('full_key, is_available')
      if (error) console.error("Fetch topics error:", error)
      if (!error && data) {
        const map: Record<string, boolean> = {}
        data.forEach(row => { map[row.full_key] = row.is_available })
        setAvailability(map)
      }
      setLoadingTopics(false)
    }
    fetchAvailability()
  }, [])

  const getCurrentTopics = () => {
    if (activeForm === "Mazoezi") return mazoeziByForm[mazoeziForm] || []
    if (activeForm === "Bonus") return nectaYears
    return syllabus[activeForm] || []
  }
  const getKeyPrefix = () => {
    if (activeForm === "Mazoezi") return `Mazoezi - ${mazoeziForm}`
    if (activeForm === "Bonus") return bonusForm
    return activeForm
  }
  const toggleTopic = (topic: string) => {
    const prefix = getKeyPrefix()
    const key = `${prefix} - ${topic}`
    if (!availability[key]) return
    setSelected(prev => prev.includes(key)? prev.filter(t => t!== key) : [...prev, key])
  }
  const isTopicSelected = (topic: string) => {
    const prefix = getKeyPrefix()
    const key = `${prefix} - ${topic}`
    return selected.includes(key)
  }
  const total = useMemo(() => selected.length * 1000, [selected])

  const handleLipa = async () => {
    if (!phone ||!whatsapp || selected.length === 0) {
      alert("Jaza namba na chagua topic")
      return
    }
    const validation = validatePaymentForm(phone, whatsapp, method)
    if (!validation.valid) {
      alert(validation.error)
      return
    }
    setSubmitting(true)
    try {
      const cleanPhone = normalizeTZPhone(phone)
      const cleanWa = normalizeTZPhone(whatsapp)
      const { data: customer, error: custErr } = await supabase.from('customers').upsert(
        { phone_malipo: cleanPhone, whatsapp_number: cleanWa },
        { onConflict: 'phone_malipo,whatsapp_number' }
      ).select().single()
      if (custErr) throw custErr
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        customer_id: customer?.id,
        phone_malipo: cleanPhone,
        whatsapp_number: cleanWa,
        payment_method: method,
        total_amount: total,
        items_count: selected.length,
        status: 'pending',
        lang: lang
      }).select().single()
      if (orderErr) throw orderErr
      const { data: catalogRows } = await supabase.from('topics_catalog').select('id, full_key, file_path').in('full_key', selected)
      type CatalogRow = { id: string; full_key: string; file_path: string | null }
      const catalogMap = new Map<string, CatalogRow>(
        (catalogRows as CatalogRow[] | null)?.map(r => [r.full_key, r])?? []
      )
      const items = selected.map(fullKey => {
        let category = 'NOTES'
        let form_name = fullKey.split(' - ')[0]
        let topic_name = fullKey.split(' - ')[1]
        if (fullKey.startsWith('Mazoezi')) {
          const p = fullKey.split(' - ')
          category = 'MAZOEZI'
          form_name = p[1]
          topic_name = p[2]
        }
        if (fullKey.includes('NECTA')) {
          const p = fullKey.split(' - ')
          category = 'BONUS'
          form_name = p[0]
          topic_name = p[1]
        }
        const catalog = catalogMap.get(fullKey)
        return {
          order_id: order.id,
          topic_catalog_id: catalog?.id || null,
          full_key: fullKey,
          form_name,
          category,
          topic_name,
          file_path: catalog?.file_path || null,
          price: 1000
        }
      })
      const { error: itemsErr } = await supabase.from('order_items').insert(items)
      if (itemsErr) throw itemsErr
      await supabase.from('payments').insert({
        order_id: order.id,
        method: method,
        phone: cleanPhone,
        amount: total,
        status: 'pending'
      })
      const res = await fetch("/api/snippe/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: order.order_number,
          amount: total,
          phone: cleanPhone,
          topic: selected[0] || "Mwalimu Math Notes",
          form: activeForm
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Imeshindwa kutengeneza link ya malipo")
      window.location.href = data.checkout_url
    } catch (err: unknown) {
      console.error("FULL ERROR:", err)
      const e = err as { message?: string; details?: string; hint?: string }
      const msg = e?.message || e?.details || e?.hint || JSON.stringify(err)
      alert("Error halisi: " + msg)
      setSubmitting(false)
    }
  }

  const currentTopics = getCurrentTopics()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1d4ed8] border-b border-blue-600 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl text-white">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><Calculator size={16} className="text-[#1d4ed8]" /></div>
            Mwalimu Math
          </div>
          <div className="flex items-center gap-1 bg-blue-600 border border-blue-500 rounded-full px-3 py-1">
            <Globe size={14} className="text-white" />
            <select value={lang} onChange={(e) => setLang(e.target.value === 'en'? 'en' : 'sw')} className="bg-transparent text-white text-xs font-bold outline-none">
              <option value="sw" className="text-black">Kiswahili</option>
              <option value="en" className="text-black">English</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex justify-start items-center mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1d4ed8]">
              <ArrowLeft size={16} /> {tr.rudi}
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold">{tr.title} {loadingTopics && <span className="text-sm font-normal text-gray-400">(Inapakia...)</span>}</h1>

          {/* VIDATO - 2 ROWS x 4 COLS = 8 BUTTONS, NDOGO NA TITLE FIT ROW 1 */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {Object.keys(syllabus).map(form => (
              <button
                key={form}
                onClick={() => setActiveForm(form)}
                className={`w-full px-2 py-2 rounded-full text- sm:text-xs font-bold border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center whitespace-nowrap overflow-hidden text-ellipsis leading-tight ${activeForm === form? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-md' : 'bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'}`}
              >
                {form}
              </button>
            ))}
          </div>

          <div className="mt-6 bg-white rounded-2xl border p-4">
            {activeForm === "Mazoezi" && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-4">
                {Object.keys(mazoeziByForm).map(f => (
                  <button key={f} onClick={() => setMazoeziForm(f)} className={`w-full px-2 py-1.5 rounded-full text- sm:text- font-bold border cursor-pointer transition-all duration-200 hover:scale-[1.02] text-center whitespace-nowrap ${mazoeziForm === f? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-sm' : 'bg-gray-50 hover:bg-white hover:border-gray-300'}`}>{f}</button>
                ))}
              </div>
            )}
            {activeForm === "Bonus" && (
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {bonusForms.map(f => (
                  <button key={f} onClick={() => setBonusForm(f)} className={`w-full px-2 py-1.5 rounded-full text- sm:text- font-bold border cursor-pointer transition-all duration-200 hover:scale-[1.02] text-center whitespace-nowrap leading-tight ${bonusForm === f? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-sm' : 'bg-gray-50 hover:bg-white hover:border-gray-300'}`}>{f}</button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {currentTopics.map(topic => {
                const prefix = getKeyPrefix()
                const key = `${prefix} - ${topic}`
                const isAvailable = availability[key] || false
                const selectedNow = isTopicSelected(topic)
                return (
                  <div
                    key={topic}
                    onClick={() => isAvailable && toggleTopic(topic)}
                    className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-200 ${isAvailable? 'cursor-pointer hover:shadow-sm hover:border-gray-300 hover:-translate-y- active:translate-y-0' : 'cursor-not-allowed'} ${selectedNow? 'bg-blue-50 border-[#1d4ed8] shadow-sm' : 'bg-white'} ${!isAvailable? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        disabled={!isAvailable}
                        checked={selectedNow && isAvailable}
                        onChange={() => isAvailable && toggleTopic(topic)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 accent-[#1d4ed8] cursor-pointer"
                      />
                      <span className={`text-sm font-medium ${!isAvailable? 'text-gray-400' : ''}`}>{topic}</span>
                    </div>
                    <span className={`text-xs font-bold ${isAvailable? 'text-green-600' : 'text-gray-400'}`}>{isAvailable? tr.ipo : tr.haijapakiwa}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5 h-fit sticky top-20">
          <h3 className="font-bold text-sm">{tr.muhtasari}</h3>
          {selected.length === 0? <p className="text-xs text-gray-500 mt-3">{tr.empty}</p> :
            <ul className="mt-3 space-y-1 max-h-48 overflow-auto">
              {selected.map(s => <li key={s} className="text-xs flex gap-2"><Check size={12} className="text-green-500 mt-0.5" />{s}</li>)}
            </ul>
          }
          <div className="border-t mt-4 pt-4 flex justify-between font-black text-sm">
            <span>{tr.jumla}</span><span className="text-[#1d4ed8]">TZS {total.toLocaleString()}</span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold mb-2">{tr.chaguaMtandao}</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ name: "M-Pesa", color: "bg-red-600" }, { name: "Mixx by Yas", color: "bg-purple-600" }, { name: "Airtel Money", color: "bg-red-500" }, { name: "HaloPesa", color: "bg-orange-500" }].map(m => (
                <button key={m.name} onClick={() => setMethod(m.name)} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm active:scale-[0.98] ${method === m.name? 'border-[#1d4ed8] bg-blue-50 shadow-sm' : 'hover:bg-gray-50 hover:border-gray-300'}`}>
                  <span className={`w-2 h-2 rounded-full ${m.color}`}></span>{m.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-bold">{tr.simuMalipo}</label>
              <div className="flex items-center border rounded-xl px-3 py-2.5 mt-1 gap-2">
                <Smartphone size={16} className="text-gray-400" /><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="07xx xxx xxx" className="w-full outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold">{tr.whatsappLabel}</label>
              <div className="flex items-center border rounded-xl px-3 py-2.5 mt-1 gap-2">
                <MessageCircle size={16} className="text-green-500" /><input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="07xx xxx xxx" className="w-full outline-none text-sm" />
              </div>
            </div>
          </div>
          <button
            onClick={handleLipa}
            disabled={selected.length === 0 ||!phone ||!whatsapp || submitting}
            className="w-full mt-5 bg-[#1d4ed8] text-white py-3 rounded-xl font-bold text-sm
              cursor-pointer
              transition-all duration-200 ease-out
              hover:bg-[#1e40af] hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-
              active:translate-y-0 active:shadow-md active:scale-[0.98]
              disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:hover:bg-gray-300
              focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:ring-offset-2 focus:ring-offset-white
              flex items-center justify-center gap-2"
          >
            {submitting? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Inatuma...
              </>
            ) : (
              `Lipa TZS ${total.toLocaleString()} kwa ${method}`
            )}
          </button>
          <p className="text-xs text-center text-gray-500 mt-3">{tr.whatsappNote}</p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return <div className="p-10 text-center text-sm">Inapakia...</div>
}

export default function NotesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NotesContent />
    </Suspense>
  )
}