"use client"
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Search, ChevronRight, ChevronDown } from "lucide-react"

type TopicRow = { id: number; full_key: string; form_name: string; category: string; topic_name: string; is_available: boolean; has_pdf: boolean; storage_path: string | null }
const FORMS = ["Form I","Form II","Form III","Form IV","Form V","Form VI","Mazoezi","Bonus"]
const materialTypes = [
  { label: "Scheme of works", href: "/admin/academics/materials/schemes" },
  { label: "Lesson plan", href: "/admin/academics/materials/plans" },
  { label: "Books", href: "/admin/academics/materials/books" },
  { label: "Timetable", href: "/admin/academics/materials/timetable" },
  { label: "Teaching aids", href: "/admin/academics/materials/aids" },
  { label: "Pdfs", href: "/admin/academics/materials/pdfs" },
]

export default function PdfsPage(){
  const router = useRouter()
  const [topics,setTopics]=useState<TopicRow[]>([])
  const [loading,setLoading]=useState(true)
  const [filterForm,setFilterForm]=useState("Form I")
  const [search,setSearch]=useState("")
  const [savingId,setSavingId]=useState<number|null>(null)
  const [showTypeDropdown,setShowTypeDropdown]=useState(false)

  const fetchTopics=async()=>{
    setLoading(true)
    const {data,error}=await supabase.from("topics_catalog").select("*").order("full_key",{ascending:true})
    if(!error && data){
      let filtered=data as TopicRow[]
      if(filterForm!=="All"){
        if(filterForm==="Mazoezi") filtered=filtered.filter(t=>t.category==="MAZOEZI")
        else if(filterForm==="Bonus") filtered=filtered.filter(t=>t.category==="BONUS")
        else filtered=filtered.filter(t=>t.form_name===filterForm || t.full_key.startsWith(filterForm))
      }
      setTopics(filtered)
    }
    setLoading(false)
  }

  useEffect(()=>{
    fetchTopics()
  },[filterForm])

  const toggleAvailability=async(row:TopicRow)=>{
    setSavingId(row.id)
    const newVal=!row.is_available
    if(newVal &&!row.storage_path){ if(!confirm(`Topic "${row.full_key}" haina storage_path. Washa tu?`)){setSavingId(null);return} }
    const {error}=await supabase.from("topics_catalog").update({is_available:newVal}).eq("id",row.id)
    if(!error) setTopics(prev=>prev.map(t=>t.id===row.id?{...t,is_available:newVal}:t))
    else alert(error.message)
    setSavingId(null)
  }

  const bulkAction=async(action:"on"|"off")=>{
    if(!confirm(`Unataka ${action==="on"?"KUWASHA":"KUZIMA"} zote za ${filterForm}?`)) return
    const ids=filteredTopics.map(t=>t.id)
    const {error}=await supabase.from("topics_catalog").update({is_available:action==="on"}).in("id",ids)
    if(error) alert(error.message)
    else fetchTopics()
  }

  const filteredTopics=topics.filter(t=>!search || t.full_key.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500"><span>Dashboard</span><ChevronRight size={14}/><span>Academics</span><ChevronRight size={14}/><span>Manage Materials</span><ChevronRight size={14}/><span className="font-bold text-[#1d4ed8]">Pdfs</span></div>
        <div className="w-full md:w-1/2 md:max-w-md relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search material..." className="w-full pl-9 pr-4 py-2 rounded-full border bg-gray-50 text-xs outline-none"/></div>
      </div>

      <div className="bg-white p-3 rounded-xl border">
        <div className="relative inline-block">
          <button onClick={()=>setShowTypeDropdown(!showTypeDropdown)} className="flex items-center gap-2 border rounded-lg px-4 py-2 text-xs font-bold min-w- justify-between bg-[#eef2ff] text-[#1d4ed8]">Pdfs <ChevronDown size={14} className={`${showTypeDropdown?'rotate-180':''} transition`}/></button>
          {showTypeDropdown && <div className="absolute mt-2 w-60 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">{materialTypes.map(it=><button key={it.href} onClick={()=>{setShowTypeDropdown(false);router.push(it.href)}} className="w-full text-left px-4 py-2.5 text-xs hover:bg-[#eef2ff]">{it.label}</button>)}</div>}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-3 space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-1.5">
          <button onClick={()=>setFilterForm("All")} className={`px-2 py-1.5 rounded-full text- font-bold border ${filterForm==="All"?"bg-[#1d4ed8] text-white":"bg-gray-50"}`}>All</button>
          {FORMS.map(f=><button key={f} onClick={()=>setFilterForm(f)} className={`px-2 py-1.5 rounded-full text- font-bold border truncate ${filterForm===f?"bg-[#1d4ed8] text-white":"bg-gray-50"}`}>{f}</button>)}
        </div>
        <div className="flex justify-between items-center"><span className="text- bg-gray-100 px-2.5 py-1 rounded-full font-bold">{filteredTopics.length} topics</span><div className="flex gap-1.5"><button onClick={()=>bulkAction("on")} className="px-3 py-1.5 bg-green-600 text-white rounded-full text- font-bold">Washa ({filterForm})</button><button onClick={()=>bulkAction("off")} className="px-3 py-1.5 bg-red-600 text-white rounded-full text- font-bold">Zima</button></div></div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="hidden md:block overflow-x-auto"><table className="w-full text-xs"><thead className="bg-gray-50 text- text-gray-500"><tr><th className="text-left px-3 py-2">Topic (full_key)</th><th className="text-left px-3 py-2">PDF?</th><th className="text-left px-3 py-2">Storage Path</th><th className="text-center px-3 py-2">Ipo / Haijapakiwa</th><th className="text-center px-3 py-2">Action</th></tr></thead><tbody>{loading?<tr><td colSpan={5} className="text-center py-8 text-gray-400">Inapakia...</td></tr>:filteredTopics.map(row=><tr key={row.id} className="border-t hover:bg-gray-50"><td className="px-3 py-2"><div className="font-medium text-">{row.full_key}</div><div className="text- text-gray-400">{row.category} • {row.form_name}</div></td><td className="px-3 py-2"><span className={`text- px-2 py-0.5 rounded-full font-bold ${row.has_pdf?"bg-green-100 text-green-700":"bg-gray-100"}`}>{row.has_pdf?"PDF Ipo":"Hakuna PDF"}</span></td><td className="px-3 py-2 text- truncate max-w-">{row.storage_path||"-"}</td><td className="px-3 py-2 text-center"><span className={`text- px-2 py-0.5 rounded-full font-bold ${row.is_available?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{row.is_available?"Ipo":"Haijapakiwa"}</span></td><td className="px-3 py-2 text-center"><button disabled={savingId===row.id} onClick={()=>toggleAvailability(row)} className={`px-3 py-1 rounded-full text- font-bold ${row.is_available?"bg-red-600 text-white":"bg-[#1d4ed8] text-white"}`}>{savingId===row.id?"...":row.is_available?"ZIMA":"WASHA"}</button></td></tr>)}</tbody></table></div>
        <div className="md:hidden space-y-2 p-2">{filteredTopics.map(row=><div key={row.id} className="border rounded-xl p-3"><div className="flex justify-between mb-2"><div className="font-bold text- truncate">{row.full_key}</div><span className={`text- px-2 py-0.5 rounded-full font-bold ${row.is_available?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{row.is_available?"Ipo":"Haijapakiwa"}</span></div><button disabled={savingId===row.id} onClick={()=>toggleAvailability(row)} className={`w-full py-2 rounded-full text- font-bold ${row.is_available?"bg-red-600 text-white":"bg-[#1d4ed8] text-white"}`}>{row.is_available?"ZIMA - Funga":"WASHA - Fungua"}</button></div>)}</div>
      </div>
    </div>
  )
}