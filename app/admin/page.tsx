"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Check, X, Search, LogOut, Eye, EyeOff, Home } from "lucide-react"

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
  const [authed, setAuthed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mwalimu_admin_authed") === "true"
    }
    return false
  })
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterForm, setFilterForm] = useState("Form I")
  const [search, setSearch] = useState("")
  const [savingId, setSavingId] = useState<number | null>(null)

  const ADMIN_PASS = "mwalimu2026" // badilisha baadaye uweke kwenye env

  useEffect(() => {
    if (!authed) return
    const load = async () => {
      const { data, error } = await supabase
        .from("topics_catalog")
        .select("*")
        .order("full_key", { ascending: true })

      if (!error && data) {
        let filtered = data as TopicRow[]
        if (filterForm !== "All") {
          if (filterForm === "Mazoezi") {
            filtered = filtered.filter(t => t.category === "MAZOEZI")
          } else if (filterForm === "Bonus") {
            filtered = filtered.filter(t => t.category === "BONUS")
          } else {
            filtered = filtered.filter(t => t.form_name === filterForm || t.full_key.startsWith(filterForm))
          }
        }
        setTopics(filtered)
      }
      setLoading(false)
    }
    load()
  }, [authed, filterForm])

  const fetchTopics = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("topics_catalog")
      .select("*")
      .order("full_key", { ascending: true })

    if (!error && data) {
      let filtered = data as TopicRow[]
      if (filterForm !== "All") {
        if (filterForm === "Mazoezi") {
          filtered = filtered.filter(t => t.category === "MAZOEZI")
        } else if (filterForm === "Bonus") {
          filtered = filtered.filter(t => t.category === "BONUS")
        } else {
          filtered = filtered.filter(t => t.form_name === filterForm || t.full_key.startsWith(filterForm))
        }
      }
      setTopics(filtered)
    }
    setLoading(false)
  }

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setAuthed(true)
      localStorage.setItem("mwalimu_admin_authed", "true")
    } else {
      alert("Password si sahihi!")
    }
  }

  const toggleAvailability = async (row: TopicRow) => {
    setSavingId(row.id)
    const newVal = !row.is_available

    // Lazima iwe na PDF ndipo uwashwe
    if (newVal && !row.storage_path) {
      const ok = confirm(`Topic "${row.full_key}" haina storage_path (PDF). Unataka kuiwasha tu bila PDF?`)
      if (!ok) {
        setSavingId(null)
        return
      }
    }

    const { error } = await supabase
      .from("topics_catalog")
      .update({ is_available: newVal })
      .eq("id", row.id)

    if (error) {
      alert("Error: " + error.message)
    } else {
      setTopics(prev => prev.map(t => t.id === row.id ? { ...t, is_available: newVal } : t))
    }
    setSavingId(null)
  }

  const toggleHasPdf = async (row: TopicRow) => {
    setSavingId(row.id)
    const { error } = await supabase
      .from("topics_catalog")
      .update({ has_pdf: !row.has_pdf })
      .eq("id", row.id)
    if (!error) {
      setTopics(prev => prev.map(t => t.id === row.id ? { ...t, has_pdf: !t.has_pdf } : t))
    }
    setSavingId(null)
  }

  const bulkAction = async (action: "on" | "off") => {
    if (!confirm(`Unataka ${action === "on" ? "KUWASHA" : "KUZIMA"} topics zote za ${filterForm}?`)) return
    const ids = filteredTopics.map(t => t.id)
    const { error } = await supabase
      .from("topics_catalog")
      .update({ is_available: action === "on" })
      .in("id", ids)
    if (error) alert(error.message)
    else fetchTopics()
  }

  const filteredTopics = topics.filter(t => {
    if (!search) return true
    return t.full_key.toLowerCase().includes(search.toLowerCase()) || t.topic_name.toLowerCase().includes(search.toLowerCase())
  })

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border p-8 w-full max-w-sm">
          <h1 className="text-xl font-black mb-2">Admin - Mwalimu Math</h1>
          <p className="text-sm text-gray-500 mb-6">Ingiza password kuendelea</p>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-[#1d4ed8]"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button onClick={handleLogin} className="w-full mt-4 bg-[#1d4ed8] text-white py-3 rounded-xl font-bold text-sm">
            Ingia
          </button>
          <p className="text-xs text-gray-400 mt-4 text-center">Default: mwalimu2026 (badilisha kwenye code)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1d4ed8] text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-black">Mwalimu Math - Admin Panel</h1>
          <div className="flex gap-2 items-center">
            <Link href="/notes" target="_blank" className="text-xs bg-blue-600 px-3 py-1.5 rounded-full">Tazama Site</Link>
            <button onClick={() => { localStorage.removeItem("mwalimu_admin_authed"); setAuthed(false) }} className="p-2 bg-blue-600 rounded-full">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setLoading(true); setFilterForm("All") }} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filterForm === "All" ? "bg-[#1d4ed8] text-white" : "bg-gray-50"}`}>All ({topics.length})</button>
              {FORMS.map(f => (
                <button key={f} onClick={() => { setLoading(true); setFilterForm(f) }} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filterForm === f ? "bg-[#1d4ed8] text-white" : "bg-gray-50"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border bg-gray-50 hover:bg-gray-100">
                <Home size={14} /> Rudi Nyumbani
              </Link>
              <button
                onClick={() => { localStorage.removeItem("mwalimu_admin_authed"); setAuthed(false); setPassword("") }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tafuta topic..." className="pl-9 pr-4 py-2 border rounded-full text-xs w-64 outline-none" />
              </div>
              <span className="text-xs text-gray-500">{filteredTopics.length} topics</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => bulkAction("on")} className="px-4 py-2 bg-green-600 text-white rounded-full text-xs font-bold">Washa Zote ({filterForm})</button>
              <button onClick={() => bulkAction("off")} className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold">Zima Zote</button>
              <button onClick={fetchTopics} className="px-4 py-2 bg-gray-100 rounded-full text-xs font-bold">Refresh</button>
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
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">Inapakia...</td></tr>
                ) : filteredTopics.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">Hakuna topic</td></tr>
                ) : (
                  filteredTopics.map(row => (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-xs">{row.full_key}</div>
                        <div className="text-[10px] text-gray-400">{row.category} • {row.form_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleHasPdf(row)} className={`text-[10px] px-2 py-1 rounded-full font-bold ${row.has_pdf ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {row.has_pdf ? "PDF Ipo" : "Hakuna PDF"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500 max-w-[200px] truncate" title={row.storage_path || ""}>
                        {row.storage_path || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold ${row.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {row.is_available ? <><Check size={10} /> Ipo</> : <><X size={10} /> Haijapakiwa</>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          disabled={savingId === row.id}
                          onClick={() => toggleAvailability(row)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${row.is_available ? "bg-red-600 text-white hover:bg-red-700" : "bg-[#1d4ed8] text-white hover:bg-blue-700"} disabled:opacity-50`}
                        >
                          {savingId === row.id ? "..." : row.is_available ? "ZIMA" : "WASHA"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs">
          <p className="font-bold mb-1">Jinsi ya kutumia:</p>
          <ul className="list-disc ml-4 space-y-1 text-gray-700">
            <li><b>WASHA</b> = Topic inaonekana <b>Ipo</b> kwenye mwalimu-math.vercel.app/notes na mteja anaweza kui-check</li>
            <li><b>ZIMA</b> = Topic inaonekana <b>Haijapakiwa</b> na checkbox imezima</li>
            <li>Baada ya ku-upload PDF kwenda Storage, hakikisha <b>storage_path</b> imejazwa na <b>has_pdf</b> ni true, ndipo uwasha</li>
            <li>Buttons za <b>Washa Zote / Zima Zote</b> zinafanya kazi kwa filter uliochagua (mfano Form I pekee)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
