"use client"
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Search, LogOut, ArrowLeft, Globe, Menu, X, Eye } from "lucide-react"

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
  const [menuOpen, setMenuOpen] = useState(false)

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
    const currentForm = formOverride ?? filterForm
    const { data, error } = await supabase.from("topics_catalog").select("*").order("full_key", { ascending: true })
    if (!error && data) {
      let filtered = data as TopicRow[]
      if (currentForm !== "All") {
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
    const newVal = !row.is_available
    if (newVal && !row.storage_path) {
      const ok = confirm(`Topic "${row.full_key}" haina storage_path (PDF). Unataka kuiwasha tu bila PDF?`)
      if (!ok) { setSavingId(null); return }
    }
    const { error } = await supabase.from("topics_catalog").update({ is_available: newVal }).eq("id", row.id)
    if (error) alert("Error: " + error.message)
    else setTopics(prev => prev.map(t => t.id === row.id ? { ...t, is_available: newVal } : t))
    setSavingId(null)
  }

  const toggleHasPdf = async (row: TopicRow) => {
    setSavingId(row.id)
    const { error } = await supabase.from("topics_catalog").update({ has_pdf: !row.has_pdf }).eq("id", row.id)
    if (!error) setTopics(prev => prev.map(t => t.id === row.id ? { ...t, has_pdf: !t.has_pdf } : t))
    setSavingId(null)
  }

  const bulkAction = async (action: "on" | "off") => {
    if (!confirm(`Unataka ${action === "on" ? "KUWASHA" : "KUZIMA"} topics zote za ${filterForm}?`)) return
    const ids = filteredTopics.map(t => t.id)
    const { error } = await supabase.from("topics_catalog").update({ is_available: action === "on" }).in("id", ids)
    if (error) alert(error.message)
    else fetchTopics()
  }

  const filteredTopics = topics.filter(t => {
    if (!search) return true
    return t.full_key.toLowerCase().includes(search.toLowerCase()) || t.topic_name.toLowerCase().includes(search.toLowerCase())
  })

  const handleLogout = () => {
    localStorage.removeItem("mwalimu_admin_authed")
    router.push("/admin/login")
  }

  if (!authed) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-sm text-gray-500">{tr.loading}</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR - Responsive na Hamburger */}
      <header className="bg-[#1d4ed8] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-black text-sm sm:text-base truncate">Mwalimu Math - Admin Panel</h1>
          
          {/* DESKTOP MENU */}
          <div className="hidden lg:flex gap-2 items-center">
            <Link href="/notes" className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors"><ArrowLeft size={12}/> {tr.backNotes}</Link>
            <Link href="/" className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors"><Eye size={12}/> {tr.viewSite}</Link>
            <div className="flex items-center gap-1 bg-blue-600 border border-blue-500 rounded-full px-3 py-1">
              <Globe size={14} className="text-white"/>
              <select value={lang} onChange={(e)=> setLang(e.target.value as 'sw'|'en')} className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer">
                <option value="sw" className="text-black">Kiswahili</option>
                <option value="en" className="text-black">English</option>
              </select>
            </div>
            <button onClick={handleLogout} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors cursor-pointer"><LogOut size={14} /></button>
          </div>

          {/* HAMBURGER */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="lg:hidden p-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {menuOpen && (
          <div className="lg:hidden border-t border-blue-500 bg-[#1e40af] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-3">
              <Link href="/notes" onClick={() => setMenuOpen(false)} className="w-full text-sm bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl inline-flex items-center gap-2 transition-colors font-bold cursor-pointer"><ArrowLeft size={16}/> {tr.backNotes}</Link>
              <Link href="/" onClick={() => setMenuOpen(false)} className="w-full text-sm bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-xl inline-flex items-center gap-2 transition-colors font-bold cursor-pointer"><Eye size={16}/> {tr.viewSite}</Link>
              <div className="flex items-center justify-between gap-2 bg-blue-600 border border-blue-500 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2"><Globe size={16} className="text-white"/><span className="text-sm font-bold">Lugha / Language</span></div>
                <select value={lang} onChange={(e)=> setLang(e.target.value as 'sw'|'en')} className="bg-white text-black text-sm font-bold outline-none rounded-full px-3 py-1.5 cursor-pointer">
                  <option value="sw">Kiswahili</option><option value="en">English</option>
                </select>
              </div>
              <button onClick={handleLogout} className="w-full text-sm bg-red-600 hover:bg-red-500 px-4 py-3 rounded-xl inline-flex items-center gap-2 transition-colors font-bold cursor-pointer"><LogOut size={16} /> Logout</button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* FILTERS - GRID kwa mobile */}
        <div className="bg-white rounded-2xl border p-4 mb-6 shadow-sm">
          {/* Button za Vidato - Grid iliyonyooka */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2 mb-5">
            <button onClick={() => handleFilterChange("All")} className={`w-full px-3 py-2.5 rounded-full text-xs font-bold border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center ${filterForm === "All" ? "bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-md" : "bg-gray-50 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm"}`}>All</button>
            {FORMS.map(f => (
              <button key={f} onClick={() => handleFilterChange(f)} className={`w-full px-3 py-2.5 rounded-full text-xs font-bold border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center ${filterForm === f ? "bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-md" : "bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm"}`}>{f}</button>
            ))}
          </div>

          {/* Search na Bulk Actions - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start">
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tr.searchPh} className="pl-9 pr-4 py-2.5 border rounded-full text-xs w-full outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/20 transition-all" />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap font-bold bg-gray-100 px-3 py-2 rounded-full">{filteredTopics.length} {tr.topics}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
              <button onClick={() => bulkAction("on")} className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-full text-xs font-bold transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 cursor-pointer text-center">{tr.washa} ({filterForm})</button>
              <button onClick={() => bulkAction("off")} className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-full text-xs font-bold transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 cursor-pointer text-center">{tr.zima}</button>
            </div>
          </div>
        </div>

        {/* TABLE - Desktop */}
        <div className="hidden md:block bg-white rounded-2xl border overflow-hidden shadow-sm">
          <div className="overflow-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">Topic (full_key)</th>
                  <th className="text-left px-4 py-3 font-bold">PDF?</th>
                  <th className="text-left px-4 py-3 font-bold">Storage Path</th>
                  <th className="text-center px-4 py-3 font-bold">Ipo / Haijapakiwa</th>
                  <th className="text-center px-4 py-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">{tr.loading}</td></tr>
                : filteredTopics.length === 0 ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">{tr.noTopic}</td></tr>
                : filteredTopics.map(row => (
                  <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><div className="font-medium text-xs">{row.full_key}</div><div className="text-[10px] text-gray-400">{row.category} • {row.form_name}</div></td>
                    <td className="px-4 py-3"><button onClick={() => toggleHasPdf(row)} className={`text-[10px] px-2 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${row.has_pdf ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{row.has_pdf ? "PDF Ipo" : "Hakuna PDF"}</button></td>
                    <td className="px-4 py-3 text-[11px] text-gray-500 max-w-[150px] truncate">{row.storage_path || "-"}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${row.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{row.is_available ? "Ipo" : "Haijapakiwa"}</span></td>
                    <td className="px-4 py-3 text-center"><button disabled={savingId === row.id} onClick={() => toggleAvailability(row)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95 hover:shadow-md ${row.is_available ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#1d4ed8] hover:bg-blue-700 text-white"}`}>{savingId === row.id ? "..." : row.is_available ? "ZIMA" : "WASHA"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARDS - Mobile View */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border p-10 text-center text-gray-400 text-sm">{tr.loading}</div>
          ) : filteredTopics.length === 0 ? (
            <div className="bg-white rounded-2xl border p-10 text-center text-gray-400 text-sm">{tr.noTopic}</div>
          ) : (
            filteredTopics.map(row => (
              <div key={row.id} className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{row.full_key}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{row.category} • {row.form_name}</div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${row.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{row.is_available ? "Ipo" : "Haijapakiwa"}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">PDF Status</div>
                    <button onClick={() => toggleHasPdf(row)} className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer w-full ${row.has_pdf ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>{row.has_pdf ? "PDF Ipo" : "Hakuna PDF"}</button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Storage Path</div>
                    <div className="text-[10px] text-gray-600 truncate">{row.storage_path || "-"}</div>
                  </div>
                </div>

                <button disabled={savingId === row.id} onClick={() => toggleAvailability(row)} className={`w-full py-2.5 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-50 cursor-pointer hover:shadow-md active:scale-[0.98] ${row.is_available ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#1d4ed8] hover:bg-blue-700 text-white"}`}>{savingId === row.id ? "..." : row.is_available ? "ZIMA - Funga" : "WASHA - Fungua"}</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
