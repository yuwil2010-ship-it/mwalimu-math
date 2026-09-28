"use client"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

type StudentItem = {
  id: number
  name: string
  email: string
  description: string
  form: string
  photo: string
}

function getOrdinal(n: number) {
  if (n > 3 && n < 21) return "th"
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
}

const MOCK_STUDENTS: StudentItem[] = [
  { id: 1, name: "Yusuph Lihawa", email: "yusuph.form1@student.co.tz", description: "Student", form: "Form I", photo: "https://i.pravatar.cc/150?img=8" },
  { id: 2, name: "Fatma Ally", email: "fatma.form2@student.co.tz", description: "Student", form: "Form II", photo: "https://i.pravatar.cc/150?img=16" },
  { id: 3, name: "Kelvin John", email: "kelvin.form3@student.co.tz", description: "Student", form: "Form III", photo: "https://i.pravatar.cc/150?img=17" },
  { id: 4, name: "Zainab Hamis", email: "zainab.form4@student.co.tz", description: "Student", form: "Form IV", photo: "https://i.pravatar.cc/150?img=20" },
  { id: 5, name: "David Masanja", email: "david.form5@student.co.tz", description: "Student", form: "Form V", photo: "https://i.pravatar.cc/150?img=18" },
  { id: 6, name: "Aisha Juma", email: "aisha.form6@student.co.tz", description: "Student", form: "Form VI", photo: "https://i.pravatar.cc/150?img=23" },
]

const FORMS = ["Form I","Form II","Form III","Form IV","Form V","Form VI"]

export default function ManageStudentPage() {
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState<StudentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showView, setShowView] = useState(false)
  const [selected, setSelected] = useState<StudentItem | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formForm, setFormForm] = useState("Form I")
  const [formPhoto, setFormPhoto] = useState("")

  useEffect(() => {
    const load = async () => {
      const { data: rows, error } = await supabase.from("students").select("*").order("id", { ascending: true })
      if (!error && rows && rows.length > 0) setData(rows as StudentItem[])
      else setData(MOCK_STUDENTS)
      setLoading(false)
    }
    load()
  }, [])

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
    return data.filter(a => a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s) || a.form.toLowerCase().includes(s))
  }, [data, search])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const resetForm = () => { setFormName(""); setFormEmail(""); setFormForm("Form I"); setFormPhoto(""); setSelected(null) }

  const handleAdd = async () => {
    if (!formName.trim() ||!formEmail.trim()) return alert("Jaza jina na email")
    const newItem: StudentItem = { id: Date.now(), name: formName.trim(), email: formEmail.trim().toLowerCase(), description: "Student", form: formForm, photo: formPhoto || `https://i.pravatar.cc/150?u=${formEmail}` }
    const { data: inserted, error } = await supabase.from("students").insert({ name: newItem.name, email: newItem.email, description: newItem.description, form: newItem.form, photo: newItem.photo }).select().single()
    if (error) setData(prev => [newItem,...prev])
    else if (inserted) setData(prev => [inserted as StudentItem,...prev])
    resetForm(); setShowAdd(false); setCurrentPage(1)
  }

  const openEdit = (item: StudentItem) => { setSelected(item); setFormName(item.name); setFormEmail(item.email); setFormForm(item.form); setFormPhoto(item.photo); setShowEdit(true) }

  const handleEdit = async () => {
    if (!selected) return
    const { data: updated, error } = await supabase.from("students").update({ name: formName.trim(), email: formEmail.trim().toLowerCase(), form: formForm, photo: formPhoto, description: "Student" }).eq("id", selected.id).select().single()
    if (error) setData(prev => prev.map(d => d.id === selected.id? {...d, name: formName.trim(), email: formEmail.trim(), form: formForm, photo: formPhoto } : d))
    else if (updated) setData(prev => prev.map(d => d.id === selected.id? updated as StudentItem : d))
    resetForm(); setShowEdit(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Unataka kufuta huyu Mwanafunzi?")) return
    await supabase.from("students").delete().eq("id", id)
    setData(prev => prev.filter(d => d.id!== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500"><span>Dashboard</span><ChevronRight size={14} /><span>Users</span><ChevronRight size={14} /><span className="font-bold text-[#1d4ed8]">Manage Students</span></div>
        <div className="text-sm text-gray-500">{formattedDateTime}</div>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <h1 className="text-lg font-extrabold shrink-0">Students List</h1>
        <div className="w-full lg:flex-1 lg:max-w-md lg:mx-6 relative order-3 lg:order-2">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} placeholder="Search by name or form..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200/70 bg-gray-50 text-sm outline-none focus:bg-white focus:border-gray-300" />
        </div>
        <div className="flex items-center gap-3 ml-auto lg:ml-0 order-2 lg:order-3">
          <div className="flex items-center gap-2 text-sm"><span className="text-gray-500 text-xs">Show</span><select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1) }} className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white outline-none cursor-pointer"><option value={10}>10 per page</option><option value={25}>25 per page</option><option value={50}>50 per page</option><option value={100}>100 per page</option></select></div>
          <button onClick={() => { resetForm(); setShowAdd(true) }} className="inline-flex items-center gap-2 bg-[#3f3f8a] text-white px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-[#2f2f6a]"><Plus size={18} /> Add</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50/60 border-b border-gray-100 text-left"><th className="px-6 py-3 text-xs text-gray-500">SN</th><th className="px-6 py-3 text-xs text-gray-500">Photo</th><th className="px-6 py-3 text-xs text-gray-500">Name</th><th className="px-6 py-3 text-xs text-gray-500">Email</th><th className="px-6 py-3 text-xs text-gray-500">Form</th><th className="px-6 py-3 text-xs text-gray-500">Description</th><th className="px-6 py-3 text-xs text-gray-500 text-right">Actions</th></tr></thead>
            <tbody>
              {loading? <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">Inapakia...</td></tr> :
                paginated.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/40">
                    <td className="px-6 py-4 text-sm">{(currentPage - 1) * perPage + idx + 1}</td>
                    <td className="px-6 py-4"><Image src={item.photo} alt={item.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover border" unoptimized /></td>
                    <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.email}</td>
                    <td className="px-6 py-4 text-sm"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">{item.form}</span></td>
                    <td className="px-6 py-4 text-sm"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">{item.description}</span></td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => { setSelected(item); setShowView(true) }} className="p-1 hover:text-[#1d4ed8] cursor-pointer"><Eye size={18} /></button><button onClick={() => openEdit(item)} className="p-1 hover:text-[#1d4ed8] cursor-pointer"><Pencil size={18} /></button><button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-600 cursor-pointer"><Trash2 size={18} /></button></div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden">
          {loading? <div className="px-6 py-10 text-center text-sm text-gray-400">Inapakia...</div> :
            paginated.length === 0? <div className="px-6 py-10 text-center text-sm text-gray-400">Hakuna data</div> :
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-2 bg-gray-50/60 px-4 py-3 text-xs font-bold text-gray-500"><span>Student</span><span>Form</span></div>
              {paginated.map((item) => (
                <div key={item.id} className="grid grid-cols-2 px-4 py-3.5 items-center hover:bg-gray-50/40">
                  <div className="pr-2 flex gap-2.5 items-center"><Image src={item.photo} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border shrink-0" unoptimized /><div className="min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-gray-400 truncate">{item.email}</p><div className="flex gap-3 mt-1.5"><button onClick={() => { setSelected(item); setShowView(true) }} className="text-gray-400 hover:text-[#1d4ed8] cursor-pointer"><Eye size={16} /></button><button onClick={() => openEdit(item)} className="text-gray-400 hover:text-[#1d4ed8] cursor-pointer"><Pencil size={16} /></button><button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={16} /></button></div></div></div>
                  <div><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border">{item.form}</span><div className="mt-1 text- text-gray-500">{item.description}</div></div>
                </div>
              ))}
            </div>
          }
        </div>
        <div className="flex justify-between items-center px-4 md:px-6 py-4 border-t border-gray-100"><p className="text-xs text-gray-500">Showing {filtered.length === 0? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</p><div className="flex gap-1"><button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 border rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40"><ChevronLeft size={16} /></button>{Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg border text-xs font-bold cursor-pointer ${currentPage === i + 1? 'bg-[#1d4ed8] text-white' : 'bg-white'}`}>{i + 1}</button>)}<button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 border rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40"><ChevronRight size={16} /></button></div></div>
      </div>
      {showAdd && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6"><div className="flex justify-between mb-4"><h3 className="font-bold">Add New Student</h3><button onClick={() => setShowAdd(false)} className="cursor-pointer"><X size={18} /></button></div><div className="space-y-3"><input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Student Name" className="w-full border rounded-xl px-4 py-2.5 text-sm" /><input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email" className="w-full border rounded-xl px-4 py-2.5 text-sm" /><select value={formForm} onChange={e => setFormForm(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer">{FORMS.map(f=> <option key={f} value={f}>{f}</option>)}</select><input value={formPhoto} onChange={e => setFormPhoto(e.target.value)} placeholder="Photo URL (optional)" className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div><div className="flex justify-end gap-2 mt-5"><button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-xl text-sm cursor-pointer">Cancel</button><button onClick={handleAdd} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm font-bold cursor-pointer">Save</button></div></div></div>)}
      {showEdit && selected && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6"><div className="flex justify-between mb-4"><h3 className="font-bold">Edit Student - {selected.form}</h3><button onClick={() => setShowEdit(false)} className="cursor-pointer"><X size={18} /></button></div><div className="space-y-3"><input value={formName} onChange={e => setFormName(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm" /><input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm" /><select value={formForm} onChange={e => setFormForm(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white cursor-pointer">{FORMS.map(f=> <option key={f} value={f}>{f}</option>)}</select><input value={formPhoto} onChange={e => setFormPhoto(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div><div className="flex justify-end gap-2 mt-5"><button onClick={() => setShowEdit(false)} className="px-4 py-2 border rounded-xl text-sm cursor-pointer">Cancel</button><button onClick={handleEdit} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm font-bold cursor-pointer">Update</button></div></div></div>)}
      {showView && selected && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6"><h3 className="font-bold mb-4">Student Details</h3><div className="flex gap-4 items-center mb-4"><Image src={selected.photo} alt={selected.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover border-2 border-[#1d4ed8]" unoptimized /><div><p className="font-bold">{selected.name}</p><p className="text-xs text-gray-500">{selected.form} - {selected.description}</p></div></div><div className="space-y-2 text-sm"><p><span className="text-gray-500">Email:</span> {selected.email}</p><p><span className="text-gray-500">Form:</span> {selected.form}</p></div><div className="flex justify-end mt-5"><button onClick={() => setShowView(false)} className="px-5 py-2 bg-[#1d4ed8] text-white rounded-xl text-sm cursor-pointer">Close</button></div></div></div>)}
    </div>
  )
}