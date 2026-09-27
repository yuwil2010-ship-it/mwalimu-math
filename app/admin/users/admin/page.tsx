"use client"
import { useState } from "react"
import { ChevronRight, Plus } from "lucide-react"

export default function AdminListPage() {
  const [perPage, setPerPage] = useState(10)

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumbs - mahali palipokuwa na Title ya zamani */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <span>Dashboard</span>
        <ChevronRight size={14} />
        <span>Users</span>
        <ChevronRight size={14} />
        <span className="font-bold text-[#1d4ed8]">Manage Admin</span>
      </div>

      {/* 2. Title + Per Page + Add button - mstari mmoja sawa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border">
        {/* Title imehamia hapa palipokuwa na dropdown ya zamani */}
        <h1 className="font-bold text-lg text-gray-800">Admin List</h1>

        <div className="flex items-center gap-3">
          {/* Per Page iko katikati ya Title na Add button */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Show</span>
            <select value={perPage} onChange={e=>setPerPage(Number(e.target.value))} className="border rounded-lg px-2 py-1.5 text-sm outline-none">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-gray-500">per page</span>
          </div>

          <button className="bg-[#1d4ed8] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5">
            <Plus size={16}/> Add Admin
          </button>
        </div>
      </div>

      {/* Table yako iendelee hapa chini */}
      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm text-gray-400">Table content hapa...</p>
      </div>
    </div>
  )
}