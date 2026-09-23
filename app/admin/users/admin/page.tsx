"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

type AdminItem = {
  id: number
  name: string
  email: string
  description: string
  password?: string
}

export default function ManageAdminPage() {
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)

  // SOMA ROLE NA ID MOJA KWA MOJA, USIWEKE NDANI YA useEffect
  const [currentRole] = useState(() => {
    if (typeof window!== "undefined") {
      return localStorage.getItem("mwalimu_admin_role") || "admin"
    }
    return "admin"
  })
  const [currentId] = useState(() => {
    if (typeof window!== "undefined") {
      return Number(localStorage.getItem("mwalimu_admin_id") || 0)
    }
    return 0
  })

  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showView, setShowView] = useState(false)
  const [selected, setSelected] = useState<AdminItem | null>(null)

  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formDesc, setFormDesc] = useState("admin")

  useEffect(() => {
    const loadAdmins = async () => {
      const { data: admins } = await supabase.from("admins").select("*").order("id", { ascending: true })
      if (admins) setData(admins as AdminItem[])
      setLoading(false)
    }
    loadAdmins()
  }, [])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return data.filter(a => a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s))
  }, [data, search])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const canDelete = (target: AdminItem) => {
    if (target.description === "super admin" && currentRole!== "super admin") return false
    if (target.id === currentId) return false
    return true
  }

  const resetForm = () => {
    setFormName("")
    setFormEmail("")
    setFormDesc("admin")
    setSelected(null)
  }

  const handleAdd = async () => {
    if (!formName.trim() ||!formEmail.trim()) return alert("Jaza jina na email")
    const firstName = formName.trim().split(" ")[0].toLowerCase()
    const { data: inserted, error } = await supabase.from("admins").insert({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      description: formDesc,
      password: firstName
    }).select().single()
    if (error) return alert(error.message)
    if (inserted) {
      setData(prev => [inserted as AdminItem,...prev])
      resetForm()
      setShowAdd(false)
      setCurrentPage(1)
    }
  }

  const openEdit = (item: AdminItem) => {
    setSelected(item)
    setFormName(item.name)
    setFormEmail(item.email)
    setFormDesc(item.description)
    setShowEdit(true)
  }

  const handleEdit = async () => {
    if (!selected) return
    const { data: updated, error } = await supabase.from("admins").update({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      description: formDesc
    }).eq("id", selected.id).select().single()
    if (error) return alert(error.message)
    if (updated) {
      setData(prev => prev.map(d => d.id === selected.id? updated as AdminItem : d))
      resetForm()
      setShowEdit(false)
    }
  }

  const handleDelete = async (id: number) => {
    const target = data.find(d => d.id === id)
    if (target &&!canDelete(target)) return alert("Huna uwezo wa kufuta super admin")
    if (!confirm("Unataka kufuta huyu Admin?")) return
    const { error } = await supabase.from("admins").delete().eq("id", id)
    if (error) return alert(error.message)
    setData(prev => prev.filter(d => d.id!== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <h1 className="text- font-extrabold">Admins List</h1>
        <div className="w-full md:w-1/2 md:max-w- relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by name..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200/70 bg-gray-50 text-sm outline-none focus:bg-white focus:border-gray-300" />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1) }} className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white">
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
        <button onClick={() => { resetForm(); setShowAdd(true) }} className="inline-flex items-center gap-2 bg-[#3f3f8a] text-white px-5 py-2.5 rounded-lg text-sm font-bold"><Plus size={18} /> Add</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50/60 border-b border-gray-100 text-left">
              <th className="px-6 py-3 text- text-gray-500">SN</th>
              <th className="px-6 py-3 text- text-gray-500">Name</th>
              <th className="px-6 py-3 text- text-gray-500">Email</th>
              <th className="px-6 py-3 text- text-gray-500">Description</th>
              <th className="px-6 py-3 text- text-gray-500 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {loading? <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Inapakia...</td></tr> :
                paginated.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/40">
                    <td className="px-6 py-4 text-sm">{(currentPage - 1) * perPage + idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.email}</td>
                    <td className="px-6 py-4 text-sm"><span className={`px-2.5 py-1 rounded-full text- font-bold ${item.description === 'super admin'? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{item.description}</span></td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-2">
                      <button onClick={() => { setSelected(item); setShowView(true) }} className="p-1 hover:text-[#1d4ed8]"><Eye size={18} /></button>
                      <button onClick={() => openEdit(item)} className="p-1 hover:text-[#1d4ed8]"><Pencil size={18} /></button>
                      <button disabled={!canDelete(item)} onClick={() => handleDelete(item.id)} className={`p-1 ${!canDelete(item)? 'opacity-20 cursor-not-allowed' : 'hover:text-red-600'}`}><Trash2 size={18} /></button>
                    </div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
          <p className="text- text-gray-500">Showing {filtered.length === 0? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 border rounded-lg"><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }).map((_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg border text- font-bold ${currentPage === i + 1? 'bg-[#1d4ed8] text-white' : 'bg-white'}`}>{i + 1}</button>)}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 border rounded-lg"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold">Add New Admin</h3><button onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="space-y-3">
              <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Admin Name" className="w-full border rounded-xl px-4 py-2.5 text-sm" />
              <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email" className="w-full border rounded-xl px-4 py-2.5 text-sm" />
              <select value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white"><option value="admin">admin</option><option value="super admin">super admin</option></select>
              {formName && <p className="text- text-gray-500">Password default: <b className="text-[#1d4ed8]">{formName.split(' ')[0].toLowerCase()}</b></p>}
            </div>
            <div className="flex justify-end gap-2 mt-5"><button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button><button onClick={handleAdd} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm font-bold">Save</button></div>
          </div>
        </div>
      )}

      {showEdit && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold">Edit Admin</h3><button onClick={() => setShowEdit(false)}><X size={18} /></button></div>
            <div className="space-y-3">
              <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
              <input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
              <select value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white"><option value="admin">admin</option><option value="super admin">super admin</option></select>
            </div>
            <div className="flex justify-end gap-2 mt-5"><button onClick={() => setShowEdit(false)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button><button onClick={handleEdit} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm font-bold">Update</button></div>
          </div>
        </div>
      )}

      {showView && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold mb-4">Admin Details</h3>
            <div className="space-y-2 text-sm"><p><span className="text-gray-500">Name:</span> {selected.name}</p><p><span className="text-gray-500">Email:</span> {selected.email}</p><p><span className="text-gray-500">Role:</span> {selected.description}</p></div>
            <div className="flex justify-end mt-5"><button onClick={() => setShowView(false)} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}