"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronRight, ChevronDown } from "lucide-react"

const materialTypes = [
  { label: "Scheme of works", href: "/admin/academics/materials/schemes" },
  { label: "Lesson plan", href: "/admin/academics/materials/plans" },
  { label: "Books", href: "/admin/academics/materials/books" },
  { label: "Timetable", href: "/admin/academics/materials/timetable" },
  { label: "Teaching aids", href: "/admin/academics/materials/aids" },
  { label: "Pdfs", href: "/admin/academics/materials/pdfs" },
]

export default function MaterialsPage(){
  const router = useRouter()
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>Dashboard</span><ChevronRight size={14}/><span>Academics</span><ChevronRight size={14}/><span className="font-bold text-[#1d4ed8]">Manage Materials</span>
        </div>
        <div className="w-full md:w-1/2 md:max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Search material..." className="w-full pl-9 pr-4 py-2 rounded-full border bg-gray-50 text-xs outline-none" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="relative inline-block">
          <button onClick={()=> setShowTypeDropdown(!showTypeDropdown)} className="flex items-center gap-2 border rounded-lg px-4 py-2.5 text-sm bg-white font-medium min-w- justify-between">
            Select type of material <ChevronDown size={16} className={`${showTypeDropdown?'rotate-180':''} transition`} />
          </button>
          {showTypeDropdown && (
            <div className="absolute mt-2 w-60 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">
              {materialTypes.map(item=>(
                <button key={item.href} onClick={()=> router.push(item.href)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#eef2ff] hover:text-[#1d4ed8]">{item.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-10 text-center text-xs text-gray-400">
        Select a material type to view data
      </div>
    </div>
  )
}