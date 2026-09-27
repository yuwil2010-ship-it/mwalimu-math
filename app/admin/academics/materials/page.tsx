"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

type MaterialRow = { id: string; title: string; type: string; subject: string; uploadedBy: string; date: string }

const dummyMaterials: MaterialRow[] = [
  { id: "1", title: "Form I Mathematics Scheme", type: "Scheme of works", subject: "Mathematics", uploadedBy: "Mr. Josephat", date: "2026-05-01" },
  { id: "2", title: "Form II Lesson Plan - Algebra", type: "Lesson plan", subject: "Mathematics", uploadedBy: "Ms. Neema", date: "2026-05-03" },
  { id: "3", title: "Physics Book Form III", type: "Books", subject: "Physics", uploadedBy: "Dr. Asha", date: "2026-05-10" },
  { id: "4", title: "Form IV Timetable Term 2", type: "Timetable", subject: "General", uploadedBy: "Mr. Peter", date: "2026-05-12" },
  { id: "5", title: "Biology Teaching Aids", type: "Teaching aids", subject: "Biology", uploadedBy: "Ms. Grace", date: "2026-05-15" },
]

const materialTypes = [
  { label: "Scheme of works", href: "/admin/academics/materials/schemes" },
  { label: "Lesson plan", href: "/admin/academics/materials/plans" },
  { label: "Books", href: "/admin/academics/materials/books" },
  { label: "Timetable", href: "/admin/academics/materials/timetable" },
  { label: "Teaching aids", href: "/admin/academics/materials/aids" },
]

export default function MaterialsPage(){
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(25)
  const [page, setPage] = useState(1)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const filtered = useMemo(()=> dummyMaterials.filter(m=>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase())
  ), [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page-1)*perPage, page*perPage)

  return (
    <div className="space-y-4">
      {/* 1. BREADCRUMBS + SEARCH */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span>Academics</span>
          <ChevronRight size={14} />
          <span className="font-bold text-[#1d4ed8]">Manage Materials</span>
        </div>
        <div className="w-full md:w-1/2 md:max-w-md relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=> { setSearch(e.target.value); setPage(1) }} placeholder="Search material..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200/70 bg-gray-50 text-sm outline-none focus:bg-white focus:border-gray-300" />
        </div>
      </div>

      {/* 2. TITLE + PER PAGE + ADD - mstari mmoja */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <h1 className="text-lg font-extrabold">Materials List</h1>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 text-xs">Show</span>
            <select value={perPage} onChange={e=> { setPerPage(Number(e.target.value)); setPage(1) }} className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white outline-none">
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          <button className="bg-[#2d2a7a] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1e1c5a]"><Plus size={16}/> Add Material</button>
        </div>
      </div>

      {/* 3. DROPDOWN YA KUCHAGUA AINA YA MATERIAL - kabla ya table */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="relative inline-block">
          <button onClick={()=> setShowTypeDropdown(!showTypeDropdown)} className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white font-medium hover:bg-gray-50">
            Select type of material <ChevronDown size={16} className={`${showTypeDropdown?'rotate-180':''} transition`} />
          </button>
          {showTypeDropdown && (
            <div className="absolute mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
              {materialTypes.map(item=>(
                <button
                  key={item.href}
                  onClick={()=> { setShowTypeDropdown(false); router.push(item.href) }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#eef2ff] hover:text-[#1d4ed8]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. TABLE YA MATERIALS */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50/60 text-xs font-bold text-gray-500 border-b">
          <div className="col-span-1">SN</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Subject</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {paged.map((m,i)=>(
          <div key={m.id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 border-b border-gray-100 text-sm items-center gap-2 md:gap-0 hover:bg-gray-50/40">
            <div className="hidden md:block">{(page-1)*perPage + i + 1}</div>
            <div className="font-medium col-span-4">{m.title}</div>
            <div className="col-span-2"><span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">{m.type}</span></div>
            <div className="text-xs text-gray-500 col-span-2">{m.subject}</div>
            <div className="text-xs text-gray-500 col-span-1">{m.date}</div>
            <div className="flex justify-end gap-3 col-span-2"><Eye size={18} className="cursor-pointer hover:text-[#1d4ed8]"/><Pencil size={18} className="cursor-pointer hover:text-[#1d4ed8]"/><Trash2 size={18} className="cursor-pointer text-gray-300 hover:text-red-500"/></div>
          </div>
        ))}
        <div className="flex justify-between items-center px-4 md:px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">Showing {(page-1)*perPage+1} to {Math.min(page*perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <button disabled={page===1} onClick={()=> setPage(p=> Math.max(1,p-1))} className="w-8 h-8 border rounded-lg flex items-center justify-center"><ChevronLeft size={16}/></button>
            <span className="w-8 h-8 bg-[#1d4ed8] text-white rounded-lg flex items-center justify-center text-xs font-bold">{page}</span>
            <button disabled={page===totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className="w-8 h-8 border rounded-lg flex items-center justify-center"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}