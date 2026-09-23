"use client"
import { useContext, useState, useEffect } from "react"
import { Users, GraduationCap, ShieldCheck, HeartHandshake, School, ChevronLeft, ChevronRight } from "lucide-react"
import { LangContext } from "./layout"

export default function DashboardPage(){
  const lang = useContext(LangContext)
  const [now, setNow] = useState(new Date())
  const [viewDate, setViewDate] = useState(new Date())

  const tr = {
    en: { admin: "Admin", teachers: "Teachers", students: "Students", parents: "Parents", registered: "Registered Classes", classes: "classes", studentsW: "Students" },
    sw: { admin: "Msimamizi", teachers: "Walimu", students: "Wanafunzi", parents: "Wazazi", registered: "Madarasa Yaliyosajiliwa", classes: "madarasa", studentsW: "Wanafunzi" }
  }[lang]

  useEffect(()=>{ const id=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(id)},[])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const classList = [{form:"Form I",students:15},{form:"Form II",students:12},{form:"Form III",students:18},{form:"Form IV",students:10},{form:"Form V",students:14},{form:"Form VI",students:16}]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-[#16a34a] rounded-2xl p-5 text-white"><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><ShieldCheck size={18}/></div><p className="mt-4 text-3xl font-black">1</p><p className="text-xs uppercase">{tr.admin}</p></div>
        <div className="bg-[#2563eb] rounded-2xl p-5 text-white"><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><GraduationCap size={18}/></div><p className="mt-4 text-3xl font-black">12</p><p className="text-xs uppercase">{tr.teachers}</p></div>
        <div className="bg-[#ca8a04] rounded-2xl p-5 text-white"><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Users size={18}/></div><p className="mt-4 text-3xl font-black">60</p><p className="text-xs uppercase">{tr.students}</p></div>
        <div className="bg-[#1e3a8a] rounded-2xl p-5 text-white"><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><HeartHandshake size={18}/></div><p className="mt-4 text-3xl font-black">120</p><p className="text-xs uppercase">{tr.parents}</p></div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-[70%] bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#1d4ed8]"><School size={18}/></div><div><h2 className="font-bold text-">{tr.registered}</h2><p className="text-sm text-gray-500">6 {tr.classes}</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{classList.map(c=><div key={c.form} className="bg-[#f6f7fb] rounded-xl p-4"><p className="font-bold text-[#1d4ed8]">{c.form}</p><p className="text-sm mt-2"><span className="font-black text-[#1d4ed8]">{c.students}</span> {tr.studentsW}</p></div>)}</div>
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#1d4ed8] capitalize">{viewDate.toLocaleString(lang==='sw'?'sw-TZ':'en-US',{month:'long',year:'numeric'})}</p>
              <p className="text- text-gray-500 mt-1">{now.toLocaleDateString(lang==='sw'?'sw-TZ':'en-US',{weekday:'long'})} • {now.toLocaleTimeString()}</p>
            </div>
            <div className="flex gap-1"><button onClick={()=>setViewDate(new Date(year, month-1))} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"><ChevronLeft size={14}/></button><button onClick={()=>setViewDate(new Date(year, month+1))} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"><ChevronRight size={14}/></button></div>
          </div>
          <div className="bg-[#f6f7fb] rounded-xl p-3">
            <div className="grid grid-cols-7 text-center gap-1">{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} className="text- text-gray-400 font-bold py-1">{d}</div>)} {Array.from({length:firstDay}).map((_,i)=><div key={`e-${i}`}></div>)} {Array.from({length:daysInMonth}).map((_,i)=>{const day=i+1; const isToday=day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear(); return <div key={day} className="flex justify-center py-0.5"><div className={`w-7 h-7 flex items-center justify-center text- rounded-full ${isToday?"bg-gray-300 font-black":"text-gray-700"}`}>{day}</div></div>})}</div>
          </div>
        </div>
      </div>
    </div>
  )
}