"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, ChevronRight, ChevronDown, BookOpen, ClipboardList, FileText, CalendarDays, Lightbulb, Library, type LucideIcon } from "lucide-react"

type MaterialType = {
  label: string
  href: string
  desc: string
  icon: LucideIcon
  bg: string
  iconBg: string
  iconColor: string
}

const materialTypes: MaterialType[] = [
  { label: "Scheme of works", href: "/admin/academics/materials/schemes", desc: "Panga na simamia scheme of work kwa kila darasa na muhula.", icon: ClipboardList, bg: "bg-blue-50/60", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Lesson plan", href: "/admin/academics/materials/plans", desc: "Tengeneza na angalia lesson plans za kila somo kwa ufasaha.", icon: FileText, bg: "bg-green-50/60", iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "Books", href: "/admin/academics/materials/books", desc: "Vitabu pendekezi na marejeo ya wanafunzi na walimu.", icon: BookOpen, bg: "bg-purple-50/60", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "Timetable", href: "/admin/academics/materials/timetable", desc: "Ratiba za masomo, vipindi na matukio ya shule.", icon: CalendarDays, bg: "bg-orange-50/60", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { label: "Teaching aids", href: "/admin/academics/materials/aids", desc: "Vifaa saidizi vya kufundishia, maabara na visuals.", icon: Lightbulb, bg: "bg-pink-50/60", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { label: "Pdfs", href: "/admin/academics/materials/pdfs", desc: "Notes na handouts katika format ya PDF kwa kupakua.", icon: Library, bg: "bg-indigo-50/60", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
]

function getOrdinal(n: number) {
  if (n > 3 && n < 21) return "th"
  switch (n % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}

export default function MaterialsPage(){
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(25)
  const [page, setPage] = useState(1)
  const [now, setNow] = useState(new Date())
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])

  const formattedDateTime = useMemo(() => {
    const weekday = now.toLocaleDateString("en-US", { weekday: "long" })
    const day = now.getDate()
    const month = now.toLocaleDateString("en-US", { month: "long" })
    const year = now.getFullYear()
    const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
    return `${weekday} ${day}${getOrdinal(day)} of ${month} ${year} ${time}`
  }, [now])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return materialTypes.filter(m => m.label.toLowerCase().includes(s) || m.desc.toLowerCase().includes(s))
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page-1)*perPage, page*perPage)

  return (
    <div className="space-y-4 w-full">
      {/* 1. BREADCRUMBS + DATE TIME */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Dashboard</span><ChevronRight size={14}/><span>Academics</span><ChevronRight size={14}/><span className="font-bold text-[#1d4ed8]">Manage Materials</span>
        </div>
        <div className="text-sm text-gray-500">
          {formattedDateTime}
        </div>
      </div>

      {/* 2. TITLE + SEARCH KATIKATI + SHOW + ADD */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <h1 className="text-lg font-extrabold shrink-0">Materials List</h1>

        <div className="w-full lg:flex-1 lg:max-w-md lg:mx-6 relative order-3 lg:order-2">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=> { setSearch(e.target.value); setPage(1) }} placeholder="Search by name..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200/70 bg-gray-50 text-sm outline-none focus:bg-white focus:border-gray-300" />
        </div>

        <div className="flex items-center gap-3 ml-auto lg:ml-0 order-2 lg:order-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 text-xs">Show</span>
            <select value={perPage} onChange={e=> { setPerPage(Number(e.target.value)); setPage(1) }} className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white outline-none">
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <button onClick={()=> router.push("/admin/academics/materials/new")} className="bg-[#2d2a7a] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1e1c5a]"><Plus size={16}/> Add</button>
        </div>
      </div>

      {/* 3. SELECT TYPE DROPDOWN */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="relative inline-block">
          <button onClick={()=> setShowTypeDropdown(!showTypeDropdown)} className="flex items-center gap-2 border border-gray-200/70 rounded-lg px-4 py-2.5 text-sm bg-white font-medium min-w- justify-between">
            Select type of material <ChevronDown size={16} className={`${showTypeDropdown?'rotate-180':''} transition`} />
          </button>
          {showTypeDropdown && (
            <div className="absolute mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
              {materialTypes.map(item=>(
                <button key={item.href} onClick={()=> { setShowTypeDropdown(false); router.push(item.href) }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#eef2ff] hover:text-[#1d4ed8]">{item.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. CARDS GRID - View inafanya kazi sawa na dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((item) => (
          <div key={item.href} className={`rounded-2xl border border-gray-100 overflow-hidden bg-white hover:shadow-md transition ${item.bg}`}>
            <div className="p-5">
              <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor} mb-4`}>
                <item.icon size={20}/>
              </div>
              <h3 className="font-bold text- text-gray-900">{item.label}</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed min-h-">{item.desc}</p>
            </div>
            <div className="px-5 py-3 bg-white/80 border-t border-gray-100 flex justify-between items-center">
              <span className="text- text-gray-400">Tap to open</span>
              <button onClick={()=> router.push(item.href)} className="text-xs font-bold text-[#1d4ed8] hover:text-[#2d2a7a] px-3 py-1.5 rounded-full bg-[#eef2ff] hover:bg-[#dbeafe]">View</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          Hakuna material inayofanana na &apos;{search}&apos;
        </div>
      )}

      <div className="flex justify-between items-center px-1 py-2">
        <p className="text-xs text-gray-500">Showing {filtered.length === 0? 0 : (page-1)*perPage+1} to {Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
        <div className="flex gap-1">
          <button disabled={page===1} onClick={()=> setPage(p=> Math.max(1,p-1))} className="w-8 h-8 border border-gray-200 bg-white rounded-lg flex items-center justify-center disabled:opacity-40"><ChevronRight className="rotate-180" size={16}/></button>
          <span className="w-8 h-8 bg-[#1d4ed8] text-white rounded-lg flex items-center justify-center text-xs font-bold">{page}</span>
          <button disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className="w-8 h-8 border border-gray-200 bg-white rounded-lg flex items-center justify-center disabled:opacity-40"><ChevronRight size={16}/></button>
        </div>
      </div>
    </div>
  )
}