"use client"
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Search, LogOut, ArrowLeft, Globe } from "lucide-react"

type TopicRow = {
  id: number
  full_key: string
  form_name: string
  category: string
  topic_name: string
  is_available: boolean
  has_pdf: boolean
  storage_path: string | null
}

const FORMS = ["Form I", "Form II", "Form III", "Form IV", "Form V", "Form VI", "Mazoezi", "Bonus"]

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterForm, setFilterForm] = useState("Form I")
  const [search, setSearch] = useState("")
  const [savingId, setSavingId] = useState<number | null>(null)
  const [lang, setLang] = useState<'sw' | 'en'>('sw')

  const t = {
    sw: { viewSite: "Tazama Site", backNotes: "Back to Notes", washa: "Washa Zote", zima: "Zima Zote", searchPh: "Tafuta topic...", topics: "topics", loading: "Inapakia...", noTopic: "Hakuna topic" },
    en: { viewSite: "View Site", backNotes: "Back to Notes", washa: "Enable All", zima: "Disable All", searchPh: "Search topic...", topics: "topics", loading: "Loading...", noTopic: "No topic" }
  }
  const tr = t[lang]

  useEffect(() => {
    const saved = localStorage.getItem("mwalimu_admin_authed") === "true"
    if (!saved) {
      router.push("/admin/login")
      return
    }
    setAuthed(true)
  }, [])

  const fetchTopics = async (formOverride?: string) => {
    const currentForm = formOverride?? filterForm
    const { data, error } = await supabase.from("topics_catalog").select("*").order("full_key", { ascending: true })
    if (!error && data) {
      let filtered = data as TopicRow[]
      if (currentForm!== "All") {
        if (currentForm === "Mazoezi") filtered = filtered.filter(t => t.category === "MAZOEZI")
        else if (currentForm === "Bonus") filtered = filtered.filter(t => t.category === "BONUS")
        else filtered = filtered.filter(t => t.form_name === currentForm || t.full_key.startsWith(currentForm))
      }
      setTopics(filtered)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!authed) return
    fetchTopics()
  }, [authed, filterForm])

  const handleFilterChange = (form: string) => {
    setLoading(true)
    setFilterForm(form)
  }

  const toggleAvailability = async (row: TopicRow) => {
    setSavingId(row.id)
    const newVal =!row.is_available
    if (newVal &&!row.storage_path) {
      const ok = confirm(`Topic "${row.full_key}" haina storage_path (PDF). Unataka kuiwasha tu bila PDF?`)
      if (!ok) { setSavingId(null); return }
    }
    const { error } = await supabase.from("topics_catalog").update({ is_available: newVal }).eq("id", row.id)
    if (error) alert("Error: " + error.message)
    else setTopics(prev => prev.map(t => t.id === row.id? {...t, is_available: newVal } : t))
    setSavingId(null)
  }

  const toggleHasPdf = async (row: TopicRow) => {
    setSavingId(row.id)
    const { error } = await supabase.from("topics_catalog").update({ has_pdf:!row.has_pdf }).eq("id", row.id)
    if (!error) setTopics(prev => prev.map(t => t.id === row.id? {...t, has_pdf:!t.has_pdf } : t))
    setSavingId(null)
  }

  const bulkAction = async (action: "on" | "off") => {
    if (!confirm(`Unataka ${action === "on"? "KUWASHA" : "KUZIMA"} topics zote za ${filterForm}?`)) return
    const ids = filteredTopics.map(t => t.id)
    const { error } = await supabase.from("topics_catalog").update({ is_available: action === "on" }).in("id", ids)
    if (error) alert(error.message)
    else fetchTopics()
  }

  const filteredTopics = topics.filter(t => {
    if (!search) return true
    return t.full_key.toLowerCase().includes(search.toLowerCase()) || t.topic_name.toLowerCase().includes(search.toLowerCase())
  })

  if (!authed) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-sm text-gray-500">{tr.loading}</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1d4ed8] text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-black">Mwalimu Math - Admin Panel</h1>
          <div className="flex gap-2 items-center">
            <Link href="/notes" className="text-xs bg-blue-600 px-3 py-1.5 rounded-full inline-flex items-center gap-1"><ArrowLeft size={12}/> {tr.backNotes}</Link>
            <Link href="/" className="text-xs bg-blue-600 px-3 py-1.5 rounded-full">{tr.viewSite}</Link>
            {/* BUTTON YA LANGUAGE KATI YA TAZAMA SITE NA LOGOUT */}
            <div className="flex items-center gap-1 bg-blue-600 border border-blue-500 rounded-full px-3 py-1">
              <Globe size={14} className="text-white"/>
              <select value={lang} onChange={(e)=> setLang(e.target.value as 'sw'|'en')} className="bg-transparent text-white text-xs font-bold outline-none">
                <option value="sw" className="text-black">Kiswahili</option>
                <option value="en" className="text-black">English</option>
              </select>
            </div>
            <button onClick={() => { localStorage.removeItem("mwalimu_admin_authed"); router.push("/admin/login") }} className="p-2 bg-blue-600 rounded-full"><LogOut size={14} /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => handleFilterChange("All")} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filterForm === "All"? "bg-[#1d4ed8] text-white" : "bg-gray-50"}`}>All</button>
            {FORMS.map(f => (<button key={f} onClick={() => handleFilterChange(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filterForm === f? "bg-[#1d4ed8] text-white" : "bg-gray-50"}`}>{f}</button>))}
          </div>
          {/* HAPA SASA KUNA WASHA ZOTE NA ZIMA ZOTE TU - RUDI NOTES, LOGOUT, REFRESH ZIMEONDOLEWA */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr.searchPh} className="pl-9 pr-4 py-2 border rounded-full text-xs w-64 outline-none" /></div>
              <span className="text-xs text-gray-500">{filteredTopics.length} {tr.topics}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => bulkAction("on")} className="px-4 py-2 bg-green-600 text-white rounded-full text-xs font-bold">{tr.washa} ({filterForm})</button>
              <button onClick={() => bulkAction("off")} className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold">{tr.zima}</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3">Topic (full_key)</th>
                  <th className="text-left px-4 py-3">PDF?</th>
                  <th className="text-left px-4 py-3">Storage Path</th>
                  <th className="text-center px-4 py-3">Ipo / Haijapakiwa</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading? <tr><td colSpan={5} className="text-center py-10 text-gray-400">{tr.loading}</td></tr>
                : filteredTopics.length === 0? <tr><td colSpan={5} className="text-center py-10 text-gray-400">{tr.noTopic}</td></tr>
                : filteredTopics.map(row => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium text-xs">{row.full_key}</div><div className="text- text-gray-400">{row.category} • {row.form_name}</div></td>
                    <td className="px-4 py-3"><button onClick={() => toggleHasPdf(row)} className={`text- px-2 py-1 rounded-full font-bold ${row.has_pdf? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{row.has_pdf? "PDF Ipo" : "Hakuna PDF"}</button></td>
                    <td className="px-4 py-3 text- text-gray-500 max-w- truncate">{row.storage_path || "-"}</td>
                    <td className="px-4 py-3 text-center"><span className={`text- px-2 py-1 rounded-full font-bold ${row.is_available? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{row.is_available? "Ipo" : "Haijapakiwa"}</span></td>
                    <td className="px-4 py-3 text-center"><button disabled={savingId === row.id} onClick={() => toggleAvailability(row)} className={`px-4 py-1.5 rounded-full text-xs font-bold ${row.is_available? "bg-red-600 text-white" : "bg-[#1d4ed8] text-white"}`}>{savingId === row.id? "..." : row.is_available? "ZIMA" : "WASHA"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}