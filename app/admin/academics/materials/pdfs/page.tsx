"use client"
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Search, ChevronRight, ChevronLeft, Database, Upload, Loader2 } from "lucide-react"
import { mathSyllabus, computerSyllabus } from "@/lib/syllabus"

type TopicRow = { id: number; full_key: string; form_name: string; category: string; topic_name: string; subject?: string; is_available: boolean; has_pdf: boolean; storage_path: string | null }

const FORMS = ["Form I","Form II","Form III","Form IV","Form V","Form VI","Mazoezi","Bonus"]

function getOrdinal(n: number) {
  if (n > 3 && n < 21) return "th"
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
}
function getFormFolder(formName: string){
  const m = formName.match(/Form\s*([IV]+)/i)
  if(m) return `Form-${m[1].toUpperCase()}`
  return formName.replace(/\s+/g,'-')
}
function getSubjectFolder(subject?: string){
  if(!subject) return 'math'
  const s = subject.toLowerCase()
  if(s.includes('math')) return 'math'
  if(s.includes('computer') || s.includes('ict')) return 'ict'
  return 'math'
}
function buildStoragePath(row: TopicRow){
  const formFolder = getFormFolder(row.form_name)
  const subjectFolder = getSubjectFolder(row.subject)
  const safeTopic = row.topic_name.replace(/[^a-zA-Z0-9\s-]/g,'').trim().replace(/\s+/g,'-')
  const fileName = `${safeTopic}.pdf`
  if(row.category === 'MAZOEZI') return `Mazoezi/${formFolder}/${subjectFolder}/${fileName}`
  if(row.category === 'BONUS') return `Paper-Bonus/${formFolder}/${subjectFolder}/${fileName}`
  return `${formFolder}/${subjectFolder}/${fileName}`
}

export default function PdfsPage(){
  const [topics,setTopics]=useState<TopicRow[]>([])
  const [loading,setLoading]=useState(true)
  const [filterForm,setFilterForm]=useState("Form I")
  const [search,setSearch]=useState("")
  const [savingId,setSavingId]=useState<number|null>(null)
  const [uploadingId,setUploadingId]=useState<number|null>(null)
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

  const uploadPdf = async (file: File, row: TopicRow) => {
    setUploadingId(row.id)
    const path = buildStoragePath(row)
    const { error: upErr } = await supabase.storage.from("topic-pdfs").upload(path, file, { upsert: true, contentType: "application/pdf" })
    if(upErr){ alert(upErr.message); setUploadingId(null); return }
    const { error } = await supabase.from("topics_catalog").update({ has_pdf: true, storage_path: path, is_available: true }).eq("id", row.id)
    if(error) alert(error.message)
    else setTopics(prev=>prev.map(t=>t.id===row.id?{...t, has_pdf:true, storage_path:path, is_available:true}:t))
    setUploadingId(null)
  }

  const filteredTopics = topics.filter(t=>!search || t.full_key.toLowerCase().includes(search.toLowerCase()))
  const total = filteredTopics.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const paged = filteredTopics.slice((page-1)*perPage, page*perPage)
  const start = total === 0? 0 : (page-1)*perPage + 1
  const end = Math.min(page*perPage, total)

  const getPageNumbers = () => {
    const pages: (number|string)[] = []
    if(totalPages <= 7){
      for(let i=1;i<=totalPages;i++) pages.push(i)
    } else {
      pages.push(1)
      if(page > 3) pages.push("...")
      for(let i=Math.max(2, page-1); i<=Math.min(totalPages-1, page+1); i++) pages.push(i)
      if(page < totalPages-2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-500"><span>Dashboard</span><ChevronRight size={14}/><span>Academics</span><ChevronRight size={14}/><span>Manage Materials</span><ChevronRight size={14}/><span className="font-bold text-[#1d4ed8]">Pdfs</span></div>
        <div className="text-sm text-gray-500">{formattedDateTime}</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <h1 className="text-lg font-extrabold shrink-0">Pdfs List</h1>
        <div className="w-full lg:max-w- lg:mx-4 relative order-3 lg:order-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value); setPage(1)}} placeholder="Search by name..." className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200/70 bg-gray-50 text-xs outline-none focus:bg-white"/>
        </div>
        <div className="flex items-center gap-2 ml-auto lg:ml-0 order-2 lg:order-3">
          <span className="text-xs text-gray-500 font-medium">Show</span>
          <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value)); setPage(1)}} className="border border-gray-200/70 rounded-lg px-3 py-2 text-xs bg-white outline-none font-bold">
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <button disabled={seeding} onClick={seedTopics} className="inline-flex items-center gap-2 bg-[#eef2ff] text-[#1d4ed8] border border-[#dbeafe] px-4 py-2 rounded-xl text-xs font-bold"><Database size={14}/> {seeding?"Syncing...":"Sync Topics"}</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          <button onClick={()=>{setFilterForm("All"); setPage(1)}} className={`px-2 py-1.5 rounded-full text-xs font-bold border ${filterForm==="All"?"bg-[#1d4ed8] text-white":"bg-gray-50"}`}>All</button>
          {FORMS.map(f=><button key={f} onClick={()=>{setFilterForm(f); setPage(1)}} className={`px-2 py-1.5 rounded-full text-xs font-bold border truncate ${filterForm===f?"bg-[#1d4ed8] text-white":"bg-gray-50"}`}>{f}</button>)}
        </div>
        <div className="flex justify-between items-center"><span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full font-bold">{total} topics</span><div className="flex gap-1.5"><button onClick={()=>bulkAction("on")} className="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold">Washa</button><button onClick={()=>bulkAction("off")} className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold">Zima</button></div></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs"><thead className="bg-gray-50 text-gray-500"><tr><th className="text-left px-3 py-2">full_key</th><th className="text-center px-3 py-2">Status</th><th className="text-center px-3 py-2">Action</th></tr></thead><tbody>{loading?<tr><td colSpan={3} className="text-center py-8">Inapakia...</td></tr>:paged.map(row=>(
            <tr key={row.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">
                <div className="font-medium text-xs">{row.full_key}</div>
                <div className="text- text-gray-400 truncate max-w-">{row.storage_path || (row.has_pdf? 'PDF Ipo' : 'Hakuna PDF')} • {buildStoragePath(row)}</div>
              </td>
              <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full font-bold ${row.is_available?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{row.is_available?"Ipo":"Haijapakiwa"}</span></td>
              <td className="px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button disabled={savingId===row.id} onClick={()=>toggleAvailability(row)} className={`px-3 py-1 rounded-full font-bold ${row.is_available?"bg-red-600 text-white":"bg-[#1d4ed8] text-white"}`}>{savingId===row.id?"...":row.is_available?"ZIMA":"WASHA"}</button>
                  <label className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${uploadingId===row.id?'bg-gray-100':'bg-white hover:bg-gray-50'}`}>
                    {uploadingId===row.id? <Loader2 size={12} className="animate-spin"/> : <Upload size={12}/>}
                    {uploadingId===row.id? "..." : "Pakia"}
                    <input type="file" accept="application/pdf" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadPdf(f,row) }} />
                  </label>
                </div>
              </td>
            </tr>
          ))}</tbody></table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden p-2 space-y-2">
          {loading? <div className="text-center py-8 text-xs text-gray-400">Inapakia...</div> :
          paged.map(row=>(
            <div key={row.id} className="border border-gray-100 rounded-xl p-3 space-y-2 bg-white shadow-sm">
              <div className="font-bold text-xs leading-tight line-clamp-2">{row.full_key}</div>
              <div className="text- text-gray-400 break-all">{buildStoragePath(row)}</div>
              <div className="flex justify-between items-center pt-1">
                <span className={`px-2 py-0.5 rounded-full text- font-bold ${row.is_available?"bg-green-100 text-green-700":"bg-red-100 text-red-600"} ${row.has_pdf?"ring-1 ring-green-200":""}`}>{row.is_available?"Ipo":"Haijapakiwa"} {row.has_pdf?"• PDF" : ""}</span>
                <div className="flex gap-1.5">
                  <button disabled={savingId===row.id} onClick={()=>toggleAvailability(row)} className={`px-3 py-1.5 rounded-full text- font-bold ${row.is_available?"bg-red-600 text-white":"bg-[#1d4ed8] text-white"}`}>{row.is_available?"ZIMA":"WASHA"}</button>
                  <label className="px-3 py-1.5 rounded-full text- font-bold border bg-white flex items-center gap-1">
                    <Upload size={10}/> Pakia
                    <input type="file" accept="application/pdf" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadPdf(f,row) }} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center px-4 py-3 border-t bg-white">
          <span className="text-xs text-gray-500">Showing {start} to {end} of {total}</span>
          <div className="flex items-center gap-1">
            <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={14}/></button>
            {getPageNumbers().map((p,i)=> p==="..."? <span key={`dot-${i}`} className="px-1 text-xs">...</span> :
              <button key={`${p}-${i}`} onClick={()=>setPage(p as number)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${page===p?"bg-[#1d4ed8] text-white shadow-sm":"border border-gray-200 hover:bg-gray-50"}`}>{p}</button>
            )}
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}