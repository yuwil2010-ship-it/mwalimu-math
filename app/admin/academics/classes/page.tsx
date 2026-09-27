"use client"
import { useState, useMemo } from "react"
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

type ClassRow = { id: string; name: string; teacher: string; students: number; capacity: number; room: string; status: string }

const dummyClasses: ClassRow[] = [
  { id: "1", name: "Form I - A", teacher: "Mr. Josephat", students: 45, capacity: 50, room: "Block A-01", status: "active" },
  { id: "2", name: "Form I - B", teacher: "Ms. Neema", students: 42, capacity: 50, room: "Block A-02", status: "active" },
  { id: "3", name: "Form II - A", teacher: "Mr. Baraka", students: 38, capacity: 45, room: "Block B-01", status: "active" },
  { id: "4", name: "Form III - Science", teacher: "Dr. Asha", students: 30, capacity: 40, room: "Lab 1", status: "active" },
  { id: "5", name: "Form IV - General", teacher: "Mr. Peter", students: 50, capacity: 50, room: "Block C-01", status: "full" },
  { id: "6", name: "Form V - PCM", teacher: "Eng. Yusuf", students: 28, capacity: 35, room: "Block D-01", status: "active" },
  { id: "7", name: "Form VI - PGM", teacher: "Ms. Grace", students: 32, capacity: 35, room: "Block D-02", status: "active" },
]

export default function ClassesPage(){
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(25)
  const [page, setPage] = useState(1)

  const filtered = useMemo(()=> dummyClasses.filter(c=> c.name.toLowerCase().includes(search.toLowerCase()) || c.teacher.toLowerCase().includes(search.toLowerCase())), [search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page-1)*perPage, page*perPage)

  return (
    <div className="space-y-4">
      {/* 1. BREADCRUMBS + SEARCH - kama Admin Page */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span>Academics</span>
          <ChevronRight size={14} />
          <span className="font-bold text-[#1d4ed8]">Manage Classes</span>
        </div>
        <div className="w-full md:w-1/2 md:max-w-md relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=> { setSearch(e.target.value); setPage(1) }} placeholder="Search by name..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200/70 bg-gray-50 text-sm outline-none focus:bg-white focus:border-gray-300" />
        </div>
      </div>

      {/* 2. TITLE + PER PAGE + ADD - mstari mmoja sawa */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <h1 className="text-lg font-extrabold">Classes List</h1>

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
          <button className="bg-[#2d2a7a] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1e1c5a]"><Plus size={16}/> Add</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50/60 text-xs font-bold text-gray-500 border-b">
          <div className="col-span-1">SN</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Teacher</div>
          <div className="col-span-1">Students</div>
          <div className="col-span-2">Room</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {paged.map((c,i)=>(
          <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 border-b border-gray-100 text-sm items-center gap-2 md:gap-0 hover:bg-gray-50/40">
            <div className="hidden md:block">{(page-1)*perPage + i + 1}</div>
            <div className="font-medium col-span-3">{c.name}</div>
            <div className="text-gray-500 text-xs md:text-sm col-span-2">{c.teacher}</div>
            <div className="col-span-1"><span className="font-bold text-[#1d4ed8]">{c.students}</span><span className="text-gray-400 text-xs">/{c.capacity}</span></div>
            <div className="text-xs text-gray-500 col-span-2">{c.room}</div>
            <div className="col-span-1"><span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{c.status}</span></div>
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