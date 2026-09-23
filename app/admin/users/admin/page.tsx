"use client"
import { useState, useMemo } from "react"
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

type AdminItem = {
  id: number
  name: string
  email: string
  description: string
}

const initialData: AdminItem[] = [
  { id: 1, name: "Admin Mkuu", email: "admin@mwalimumath.co.tz", description: "—" },
  { id: 2, name: "Juma Said", email: "juma@mwalimumath.co.tz", description: "—" },
  { id: 3, name: "Asha Mohamed", email: "asha@mwalimumath.co.tz", description: "—" },
  { id: 4, name: "Yusuph Ali", email: "yusuph@mwalimumath.co.tz", description: "—" },
  { id: 5, name: "Neema John", email: "neema@mwalimumath.co.tz", description: "—" },
  { id: 6, name: "Baraka Musa", email: "baraka@mwalimumath.co.tz", description: "—" },
]

export default function ManageAdminPage() {
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState<AdminItem[]>(initialData)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")

  const filtered = useMemo(() => {
    return data.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
  }, [data, search])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleAdd = () => {
    if(!newName.trim()) return
    const newItem: AdminItem = {
      id: data.length + 1,
      name: newName,
      email: newEmail || `${newName.toLowerCase().replace(/\s/g,'')}@mwalimumath.co.tz`,
      description: "—"
    }
    setData([newItem,...data])
    setNewName("")
    setNewEmail("")
    setShowAdd(false)
    setCurrentPage(1)
  }

  const handleDelete = (id: number) => {
    if(confirm("Unataka kufuta huyu Admin?")){
      setData(data.filter(d=> d.id!== id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Top search kama kwenye screenshot */}
      <div className="bg-white rounded-xl border p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <h2 className="font-bold text-">Admins</h2>
        <div className="flex-1 max-w-xl mx-0 md:mx-6 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e=> {setSearch(e.target.value); setCurrentPage(1)}}
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:border-[#1d4ed8]"
          />
        </div>
        <div className="hidden md:block w-20"></div>
      </div>

      {/* Header ya List + per page + Add */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text- font-extrabold">Admins List</h1>
          <select
            value={perPage}
            onChange={e=> {setPerPage(Number(e.target.value)); setCurrentPage(1)}}
            className="border rounded-lg px-3 py-2 text-sm text-gray-600 bg-white outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        <button
          onClick={()=> setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-[#3f3f8a] hover:bg-[#343470] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={18}/> Add
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b text-left">
                <th className="px-6 py-3 text- font-semibold text-gray-500">SN</th>
                <th className="px-6 py-3 text- font-semibold text-gray-500">Name</th>
                <th className="px-6 py-3 text- font-semibold text-gray-500">Email</th>
                <th className="px-6 py-3 text- font-semibold text-gray-500">Description</th>
                <th className="px-6 py-3 text- font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx)=>(
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm text-gray-500">{(currentPage-1)*perPage + idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.email}</td>
                  <td className="px-6 py-4 text-sm">{item.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3 text-gray-500">
                      <button className="hover:text-[#1d4ed8] p-1"><Eye size={18}/></button>
                      <button className="hover:text-[#1d4ed8] p-1"><Pencil size={18}/></button>
                      <button onClick={()=> handleDelete(item.id)} className="hover:text-red-600 p-1"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length===0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Hakuna Admin aliyepatikana</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - mwisho wa page */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 border-t bg-white">
          <p className="text- text-gray-500">
            Showing {(currentPage-1)*perPage+1} to {Math.min(currentPage*perPage, filtered.length)} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage===1}
              onClick={()=> setCurrentPage(p=> Math.max(1, p-1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft size={16}/>
            </button>
            {Array.from({length: totalPages}).map((_, i)=>{
              const page = i+1
              return (
                <button
                  key={page}
                  onClick={()=> setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text- font-bold border ${currentPage===page? "bg-[#1d4ed8] text-white border-[#1d4ed8]" : "bg-white hover:bg-gray-50"}`}
                >
                  {page}
                </button>
              )
            })}
            <button
              disabled={currentPage===totalPages}
              onClick={()=> setCurrentPage(p=> Math.min(totalPages, p+1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* Modal ya Add */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text- mb-4">Add New Admin</h3>
            <div className="space-y-3">
              <input value={newName} onChange={e=> setNewName(e.target.value)} placeholder="Admin Name" className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1d4ed8]" />
              <input value={newEmail} onChange={e=> setNewEmail(e.target.value)} placeholder="Email (optional)" className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1d4ed8]" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={()=> setShowAdd(false)} className="px-4 py-2 rounded-xl border text-sm">Cancel</button>
              <button onClick={handleAdd} className="px-5 py-2 rounded-xl bg-[#1d4ed8] text-white text-sm font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}