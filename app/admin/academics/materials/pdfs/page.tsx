"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Search, ChevronRight, ChevronDown } from "lucide-react"

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
const ALLOWED_ADMINS = ["yuwil2010@gmail.com"]

const materialTypes = [
  "Scheme of works",
  "Lesson plan",
  "Books",
  "Timetable",
  "Teaching aids",
  "Pdfs",
]

export default function PdfsPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterForm, setFilterForm] = useState("Form I")
  const [search, setSearch] = useState("")
  const [savingId, setSavingId] = useState<number | null>(null)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>("Pdfs")

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/admin/login")
        return
      }
      if (ALLOWED_ADMINS.length > 0 &&!ALLOWED_ADMINS.includes(session.user.email || "")) {
        await supabase.auth.signOut()
        router.push("/admin/login")
        return
      }
      setAuthed(true)
    }
    checkAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/admin/login")
    })
    return () => subscription.unsubscribe()
  }, [router])

  const fetchTopics = async (formOverride?: string) => {
    const currentForm = formOverride?? filterForm
    setLoading(true)
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTopics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, filterForm])

  const handleFilterChange = (form: string) => {
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
    return <div className="min-h- flex items-center justify-center"><p className="text-sm text-gray-500">Inapakia...</p></div>
  }

  return (
    <div className="space-y-4 w-full">
      {/* PATH + SEARCH - kutoka material page */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span>Academics</span>
          <ChevronRight size={14} />
          <span>Manage Materials</span>
          <ChevronRight size={14} />
          <span className="font-bold text-[#1d4ed8]">Pdfs</span>
        </div>
        <div className="w-full md:w-1/2 md:max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search material..." className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200/70 bg-gray-50 text-xs outline-none focus:bg-white focus:border-gray-300" />
        </div>
      </div>

      {/* DROPDOWN YA TYPE - bakiza hii tu */}
      <div className="bg-white p-3 rounded-xl border border-gray-100">
        <div className="relative inline-block">
          <button onClick={()=> setShowTypeDropdown(!showTypeDropdown)} className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-xs bg-white font-medium hover:bg-gray-50 min-w- justify-between">
            {selectedType? selectedType : "Select type of material"} <ChevronDown size={14} className={`${showTypeDropdown?'rotate-180':''} transition`} />
          </button>
          {showTypeDropdown && (
            <div className="absolute mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
              {materialTypes.map(label=>(
                <button
                  key={label}
                  onClick={()=> {
                    setSelectedType(label)
                    setShowTypeDropdown(false)
                    if(label!== "Pdfs"){
                      router.push(`/admin/academics/materials/${label.toLowerCase().replace(/ /g,'').includes('scheme')?'schemes':label.toLowerCase().replace(/ /g,'').includes('lesson')?'plans':label.toLowerCase()}`)
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#eef2ff] hover:text-[#1d4ed8] ${selectedType===label?'bg-[#eef2ff] text-[#1d4ed8] font-bold':''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT YA PDFS - ime-fit horizontally, bila kuathiri sidebar/topnav */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-1.5">
          <button onClick={() => handleFilterChange("All")} className={`px-2 py-1.5 rounded-full text- font-bold border ${filterForm === "All"? "bg-[#1d4ed8] text-white border-[#1d4ed8]" : "bg-gray-50"}`}>All</button>
          {FORMS.map(f => (
            <button key={f} onClick={() => handleFilterChange(f)} className={`px-2 py-1.5 rounded-full text- font-bold border truncate ${filterForm === f? "bg-[#1d4ed8] text-white border-[#1d4ed8]" : "bg-gray-50"}`}>{f}</button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
          <span className="text- text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-full">{filteredTopics.length} topics</span>
          <div className="flex gap-1.5">
            <button onClick={() => bulkAction("on")} className="px-3 py-1.5 bg-green-600 text-white rounded-full text- font-bold">Washa ({filterForm})</button>
            <button onClick={() => bulkAction("off")} className="px-3 py-1.5 bg-red-600 text-white rounded-full text- font-bold">Zima</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden w-full">
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text- text-gray-500">
              <tr>
                <th className="text-left px-3 py-2 font-bold">Topic (full_key)</th>
                <th className="text-left px-3 py-2 font-bold">PDF?</th>
                <th className="text-left px-3 py-2 font-bold">Storage Path</th>
                <th className="text-center px-3 py-2 font-bold">Ipo / Haijapakiwa</th>
                <th className="text-center px-3 py-2 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading? <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-xs">Inapakia...</td></tr>
                : filteredTopics.length === 0? <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-xs">Hakuna topic</td></tr>
                  : filteredTopics.map(row => (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2"><div className="font-medium text-">{row.full_key}</div><div className="text- text-gray-400">{row.category} • {row.form_name}</div></td>
                      <td className="px-3 py-2"><button onClick={() => toggleHasPdf(row)} className={`text- px-2 py-0.5 rounded-full font-bold ${row.has_pdf? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{row.has_pdf? "PDF Ipo" : "Hakuna PDF"}</button></td>
                      <td className="px-3 py-2 text- text-gray-500 max-w- truncate">{row.storage_path || "-"}</td>
                      <td className="px-3 py-2 text-center"><span className={`text- px-2 py-0.5 rounded-full font-bold ${row.is_available? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{row.is_available? "Ipo" : "Haijapakiwa"}</span></td>
                      <td className="px-3 py-2 text-center"><button disabled={savingId === row.id} onClick={() => toggleAvailability(row)} className={`px-3 py-1 rounded-full text- font-bold disabled:opacity-50 ${row.is_available? "bg-red-600 text-white" : "bg-[#1d4ed8] text-white"}`}>{savingId === row.id? "..." : row.is_available? "ZIMA" : "WASHA"}</button></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-2 p-2">
          {loading? <div className="rounded-xl border p-6 text-center text-xs text-gray-400">Inapakia...</div>
            : filteredTopics.length === 0? <div className="rounded-xl border p-6 text-center text-xs text-gray-400">Hakuna topic</div>
              : filteredTopics.map(row => (
                <div key={row.id} className="rounded-xl border p-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0"><div className="font-bold text- truncate">{row.full_key}</div><div className="text- text-gray-400 mt-0.5">{row.category} • {row.form_name}</div></div>
                    <span className={`text- px-2 py-0.5 rounded-full font-bold ${row.is_available? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{row.is_available? "Ipo" : "Haijapakiwa"}</span>
                  </div>
                  <button disabled={savingId === row.id} onClick={() => toggleAvailability(row)} className={`w-full py-2 rounded-full text- font-bold ${row.is_available? "bg-red-600 text-white" : "bg-[#1d4ed8] text-white"}`}>{savingId === row.id? "..." : row.is_available? "ZIMA - Funga" : "WASHA - Fungua"}</button>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}