"use client"
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Search, ChevronRight, ChevronDown, Database } from "lucide-react"
import { mathSyllabus, computerSyllabus } from "@/lib/syllabus"

type TopicRow = { id: number; full_key: string; form_name: string; category: string; topic_name: string; subject?: string; is_available: boolean; has_pdf: boolean; storage_path: string | null }

const FORMS = ["Form I","Form II","Form III","Form IV","Form V","Form VI","Mazoezi","Bonus"]
const materialTypes = [
  { label: "Scheme of works", href: "/admin/academics/materials/schemes" },
  { label: "Lesson plan", href: "/admin/academics/materials/plans" },
  { label: "Books", href: "/admin/academics/materials/books" },
  { label: "Timetable", href: "/admin/academics/materials/timetable" },
  { label: "Teaching aids", href: "/admin/academics/materials/aids" },
  { label: "Pdfs", href: "/admin/academics/materials/pdfs" },
]

function getOrdinal(n: number) {
  if (n > 3 && n < 21) return "th"
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
}

export default function PdfsPage(){
  const router = useRouter()
  const [topics,setTopics]=useState<TopicRow[]>([])
  const [loading,setLoading]=useState(true)
  const [filterForm,setFilterForm]=useState("Form I")
  const [search,setSearch]=useState("")
  const [savingId,setSavingId]=useState<number|null>(null)
  const [showTypeDropdown,setShowTypeDropdown]=useState(false)
  const [seeding,setSeeding]=useState(false)
  const [now,setNow]=useState(new Date())
  const [perPage,setPerPage]=useState(25)
  const [page,setPage]=useState(1)

  useEffect(()=>{ const id=setInterval(()=>setNow(new Date()),30000); return()=>clearInterval(id)},[])
  const formattedDateTime = useMemo(()=>{
    const weekday=now.toLocaleDateString("en-US",{weekday:"long"}); const day=now.getDate(); const month=now.toLocaleDateString("en-US",{month:"long"}); const year=now.getFullYear(); const time=now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false}); return `${weekday} ${day}${getOrdinal(day)} of ${month} ${year} ${time}`
  },[now])

  const fetchTopics=async()=>{
    setLoading(true)
    const {data}=await supabase.from("topics_catalog").select("*").order("full_key",{ascending:true})
    if(data){
      let filtered=data as TopicRow[]
      if(filterForm!=="All"){
        if(filterForm==="Mazoezi") filtered=filtered.filter(t=>t.category==="MAZOEZI" || t.full_key.includes("Mazoezi"))
        else if(filterForm==="Bonus") filtered=filtered.filter(t=>t.category==="BONUS" || t.full_key.includes("NECTA"))
        else filtered=filtered.filter(t=> t.full_key.includes(`- ${filterForm} -`))
      }
      setTopics(filtered)
    }
    setLoading(false)
  }
  useEffect(()=>{ fetchTopics() },[filterForm])

  const seedTopics = async () => {
    setSeeding(true)
    const allRows: { full_key: string; subject: string; form_name: string; category: string; topic_name: string; is_available: boolean; has_pdf: boolean }[] = []
    for(const [subject, syllabus] of Object.entries({Mathematics: mathSyllabus, Computer: computerSyllabus})){
      for(const [form, list] of Object.entries(syllabus)){
        for(const topic of list as string[]){
          if(!topic) continue
          allRows.push({ full_key: `${subject} - ${form} - ${topic}`, subject, form_name: form, category: "NOTES", topic_name: topic, is_available: true, has_pdf: false })
        }
      }
    }
    const {error}=await supabase.from("topics_catalog").upsert(allRows,{onConflict:"full_key"})
    if(error) alert(error.message); else { alert(`Ime-sync ${allRows.length} topics`); fetchTopics() }
    setSeeding(false)
  }

  const toggleAvailability=async(row:TopicRow)=>{
    setSavingId(row.id)
    const newVal=!row.is_available
    const {error}=await supabase.from("topics_catalog").update({is_available:newVal}).eq("id",row.id)
    if(!error) setTopics(prev=>prev.map(t=>t.id===row.id?{...t,is_available:newVal}:t))
    setSavingId(null)
  }

  const bulkAction=async(action:"on"|"off")=>{
    if(!confirm(`Unataka ${action==="on"?"KUWASHA":"KUZIMA"} zote za ${filterForm}?`)) return
    const ids=filteredTopics.map(t=>t.id)
    await supabase.from("topics_catalog").update({is_available:action==="on"}).in("id",ids)
    fetchTopics()
  }

  const filteredTopics = topics.filter(t=>!search || t.full_key.toLowerCase().includes(search.toLowerCase()))
  const paged = filteredTopics.slice((page-1)*perPage, page*perPage)

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500"><span>Dashboard</span><ChevronRight size={14}/><span>Academics</span><ChevronRight size={14}/><span>Manage Materials</span><ChevronRight size={14}/><span className="font-bold text-[#1d4ed8]">Pdfs</span></div>
        <div className="text-sm text-gray-500">{formattedDateTime}</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <h1 className="text-lg font-extrabold">Pdfs List</h1>
        <div className="w-full lg:flex-1 lg:max-w-md lg:mx-6 relative order-3 lg:order-2">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>{setSearch(e.target.value); setPage(1)}} placeholder="Search by name..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200/70 bg-gray-50 text-sm outline-none focus:bg-white focus:border-gray-300"/>
        </div>
        <div className="flex items-center gap-2 ml-auto lg:ml-0 order-2 lg:order-3">
          <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value)); setPage(1)}} className="border border-gray-200/70 rounded-lg px-3 py-2 text-sm bg-white"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>
          <button disabled={seeding} onClick={seedTopics} className="inline-flex items-center gap-2 bg-[#eef2ff] text-[#1d4ed8] border px-4 py-2.5 rounded-xl text-sm font-bold"><Database size={16}/> {seeding?"Syncing...":"Sync Topics"}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          <button onClick={()=>setFilterForm("All")} className={`px-2 py-1.5 rounded-full text-xs font-bold border ${filterForm==="All"?"bg-[#1d4ed8] text-white":"bg-gray-50"}`}>All</button>
          {FORMS.map(f=><button key={f} onClick={()=>{setFilterForm(f); setPage(1)}} className={`px-2 py-1.5 rounded-full text-xs font-bold border truncate ${filterForm===f?"bg-[#1d4ed8] text-white":"bg-gray-50"}`}>{f}</button>)}
        </div>
        <div className="flex justify-between items-center"><span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full font-bold">{filteredTopics.length} topics</span><div className="flex gap-1.5"><button onClick={()=>bulkAction("on")} className="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold">Washa</button><button onClick={()=>bulkAction("off")} className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold">Zima</button></div></div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="hidden md:block overflow-x-auto"><table className="w-full text-xs"><thead className="bg-gray-50 text-gray-500"><tr><th className="text-left px-3 py-2">full_key</th><th className="text-center px-3 py-2">Status</th><th className="text-center px-3 py-2">Action</th></tr></thead><tbody>{loading?<tr><td colSpan={3} className="text-center py-8">Inapakia...</td></tr>:paged.map(row=><tr key={row.id} className="border-t hover:bg-gray-50"><td className="px-3 py-2 font-medium">{row.full_key}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full font-bold ${row.is_available?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{row.is_available?"Ipo":"Haijapakiwa"}</span></td><td className="px-3 py-2 text-center"><button disabled={savingId===row.id} onClick={()=>toggleAvailability(row)} className={`px-3 py-1 rounded-full font-bold ${row.is_available?"bg-red-600 text-white":"bg-[#1d4ed8] text-white"}`}>{row.is_available?"ZIMA":"WASHA"}</button></td></tr>)}</tbody></table></div>
      </div>
    </div>
  )
}