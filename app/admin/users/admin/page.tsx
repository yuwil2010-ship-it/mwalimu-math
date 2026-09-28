"use client"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"

type AdminItem = { id: number; name: string; email: string; description: string; password?: string; photo?: string | null }

function getOrdinal(n: number) {
  if (n > 3 && n < 21) return "th"
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
}
const getPhotoUrl = (item: AdminItem) => {
  if (item.photo && item.photo.trim() !== "") return item.photo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=dbeafe&color=1d4ed8&bold=true`
}

export default function ManageAdminPage() {
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState<AdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())
  const [currentRole] = useState(() => typeof window!== "undefined" ? localStorage.getItem("mwalimu_admin_role") || "admin" : "admin")
  const [currentId] = useState(() => typeof window!== "undefined" ? Number(localStorage.getItem("mwalimu_admin_id") || 0) : 0)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showView, setShowView] = useState(false)
  const [selected, setSelected] = useState<AdminItem | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formDesc, setFormDesc] = useState("admin")
  const [formPhoto, setFormPhoto] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadAdmins = async () => {
      const { data: admins } = await supabase.from("admins").select("*").order("id", { ascending: true })
      if (admins) setData(admins as AdminItem[])
      setLoading(false)
    }
    loadAdmins()
  }, [])
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000 * 30); return () => clearInterval(id) }, [])

  const formattedDateTime = useMemo(() => {
    const weekday = now.toLocaleDateString("en-US", { weekday: "long" })
    const day = now.getDate()
    const month = now.toLocaleDateString("en-US", { month: "long" })
    const year = now.getFullYear()
    const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
    return `${weekday} ${day}${getOrdinal(day)} of ${month} ${year} ${time}`
  }, [now])

  const filtered = useMemo(() => { const s = search.toLowerCase(); return data.filter(a => a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s)) }, [data, search])
  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
  const canDelete = (target: AdminItem) => { if (target.description === "super admin" && currentRole!== "super admin") return false; if (target.id === currentId) return false; return true }
  const resetForm = () => { setFormName(""); setFormEmail(""); setFormDesc("admin"); setFormPhoto(""); setSelected(null) }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fileName = `admins/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("user-photos").upload(fileName, file)
    if (error) { alert(error.message); setUploading(false); return }
    const { data } = supabase.storage.from("user-photos").getPublicUrl(fileName)
    setFormPhoto(data.publicUrl)
    setUploading(false)
  }

  const handleAdd = async () => {
    if (!formName.trim() ||!formEmail.trim()) return alert("Jaza jina na email")
    const firstName = formName.trim().split(" ")[0].toLowerCase()
    const { data: inserted, error } = await supabase.from("admins").insert({ name: formName.trim(), email: formEmail.trim().toLowerCase(), description: formDesc, password: firstName, photo: formPhoto || null }).select().single()
    if (error) return alert(error.message)
    if (inserted) { setData(prev => [inserted as AdminItem,...prev]); resetForm(); setShowAdd(false); setCurrentPage(1) }
  }
  const openEdit = (item: AdminItem) => { setSelected(item); setFormName(item.name); setFormEmail(item.email); setFormDesc(item.description); setFormPhoto(item.photo || ""); setShowEdit(true) }
  const handleEdit = async () => {
    if (!selected) return
    const { data: updated, error } = await supabase.from("admins").update({ name: formName.trim(), email: formEmail.trim().toLowerCase(), description: formDesc, photo: formPhoto || null }).eq("id", selected.id).select().single()
    if (error) return alert(error.message)
    if (updated) { setData(prev => prev.map(d => d.id === selected.id? updated as AdminItem : d)); resetForm(); setShowEdit(false) }
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
        <div className="flex items-center gap-1.5 text-sm text-gray-500"><span>Dashboard</span><ChevronRight size={14} /><span>Users</span><ChevronRight size={14} /><span className="font-bold text-[#1d4ed8]">Manage Admin</span></div>
        <div className="text-sm text-gray-500">{formattedDateTime}</div>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <h1 className="text-lg font-extrabold shrink-0">Admins List</h1>
        <div className="w-full lg:flex-1 lg:max-w-md lg:mx-6 relative order-3 lg:order-2"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by name..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200/70 bg-gray-50 text-sm outline-none focus:bg-white focus:border-gray-300" /></div>
        <div className="flex items-center gap-3 ml-auto lg:ml-0 order-2 lg:order-3">
          <div className="flex items-center gap-2 text-sm"><span className="text-gray-500 text-xs">Show</span><select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1) }} className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white outline-none cursor-pointer"><option value={10}>10 per page</option><option value={25}>25 per page</option><option value={50}>50 per page</option><option value={100}>100 per page</option></select></div>
          <button onClick={() => { resetForm(); setShowAdd(true) }} className="inline-flex items-center gap-2 bg-[#3f3f8a] text-white px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-[#2f2f6a]"><Plus size={18} /> Add</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50/60 border-b border-gray-100 text-left"><th className="px-6 py-3 text-xs text-gray-500">SN</th><th className="px-6 py-3 text-xs text-gray-500">Photo</th><th className="px-6 py-3 text-xs text-gray-500">Name</th><th className="px-6 py-3 text-xs text-gray-500">Email</th><th className="px-6 py-3 text-xs text-gray-500">Description</th><th className="px-6 py-3 text-xs text-gray-500 text-right">Actions</th></tr></thead>
            <tbody>{loading? <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Inapakia...</td></tr> : paginated.map((item, idx) => (<tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/40"><td className="px-6 py-4 text-sm">{(currentPage - 1) * perPage + idx + 1}</td><td className="px-6 py-4"><Image src={getPhotoUrl(item)} alt={item.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover border" unoptimized /></td><td className="px-6 py-4 text-sm font-medium">{item.name}</td><td className="px-6 py-4 text-sm text-gray-500">{item.email}</td><td className="px-6 py-4 text-sm"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.description === 'super admin'? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{item.description}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => { setSelected(item); setShowView(true) }} className="p-1 hover:text-[#1d4ed8] cursor-pointer"><Eye size={18} /></button><button onClick={() => openEdit(item)} className="p-1 hover:text-[#1d4ed8] cursor-pointer"><Pencil size={18} /></button><button disabled={!canDelete(item)} onClick={() => handleDelete(item.id)} className={`p-1 cursor-pointer ${!canDelete(item)? 'opacity-20 cursor-not-allowed' : 'hover:text-red-600'}`}><Trash2 size={18} /></button></div></td></tr>))}</tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-4 md:px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">Showing {filtered.length === 0? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 border rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg border text-xs font-bold cursor-pointer ${currentPage === i + 1? 'bg-[#1d4ed8] text-white' : 'bg-white'}`}>{i + 1}</button>)}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 border rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      {showAdd && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6"><div className="flex justify-between mb-4"><h3 className="font-bold">Add New Admin</h3><button onClick={() => setShowAdd(false)} className="cursor-pointer"><X size={18} /></button></div><div className="space-y-3"><input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Admin Name" className="w-full border rounded-xl px-4 py-2.5 text-sm" /><input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email" className="w-full border rounded-xl px-4 py-2.5 text-sm" /><div className="border border-dashed rounded-xl p-3"><label className="flex items-center gap-2 text-sm cursor-pointer"><Upload size={16} /> {uploading? "Inapakia..." : "Chagua picha kutoka computer"}<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label>{formPhoto && <Image src={formPhoto} alt="preview" width={80} height={80} className="mt-2 w-20 h-20 rounded-full object-cover" unoptimized />}</div><select value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer"><option value="admin">admin</option><option value="super admin">super admin</option></select></div><div className="flex justify-end gap-2 mt-5"><button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-xl text-sm cursor-pointer">Cancel</button><button onClick={handleAdd} disabled={uploading} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm font-bold cursor-pointer">Save</button></div></div></div>)}
      {showEdit && selected && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6"><div className="flex justify-between mb-4"><h3 className="font-bold">Edit Admin</h3><button onClick={() => setShowEdit(false)} className="cursor-pointer"><X size={18} /></button></div><div className="space-y-3"><input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm" /><input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm" /><div className="border border-dashed rounded-xl p-3"><label className="flex items-center gap-2 text-sm cursor-pointer"><Upload size={16} /> {uploading? "Inapakia..." : "Badilisha picha"}<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label>{formPhoto && <Image src={formPhoto} alt="preview" width={80} height={80} className="mt-2 w-20 h-20 rounded-full object-cover" unoptimized />}</div><select value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer"><option value="admin">admin</option><option value="super admin">super admin</option></select></div><div className="flex justify-end gap-2 mt-5"><button onClick={() => setShowEdit(false)} className="px-4 py-2 border rounded-xl text-sm cursor-pointer">Cancel</button><button onClick={handleEdit} disabled={uploading} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm font-bold cursor-pointer">Update</button></div></div></div>)}
      {showView && selected && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6"><h3 className="font-bold mb-4">Admin Details</h3><div className="flex gap-4 items-center mb-4"><Image src={getPhotoUrl(selected)} alt={selected.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover border-2 border-[#1d4ed8]" unoptimized /><div><p className="font-bold">{selected.name}</p><p className="text-xs text-gray-500">{selected.description}</p></div></div><div className="space-y-2 text-sm"><p><span className="text-gray-500">Name:</span> {selected.name}</p><p><span className="text-gray-500">Email:</span> {selected.email}</p></div><div className="flex justify-end mt-5"><button onClick={() => setShowView(false)} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm cursor-pointer">Close</button></div></div></div>)}
    </div>
  )
}