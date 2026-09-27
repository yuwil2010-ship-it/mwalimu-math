"use client"
import Link from "next/link"
import { School, BookOpen, Clock, ClipboardCheck, FileBarChart, ArrowRight } from "lucide-react"

const cards = [
  { title: "Manage Classes", desc: "6 Classes - Form I to VI", href: "/admin/academics/classes", icon: School, color: "bg-blue-100 text-blue-600" },
  { title: "Manage Materials", desc: "200 Topics - Notes & Mazoezi", href: "/admin/academics/materials", icon: BookOpen, color: "bg-green-100 text-green-600" },
  { title: "Manage Periods", desc: "Timetable & Periods", href: "/admin/academics/periods", icon: Clock, color: "bg-orange-100 text-orange-600" },
  { title: "Manage Attendance", desc: "Daily attendance records", href: "/admin/academics/attendance", icon: ClipboardCheck, color: "bg-purple-100 text-purple-600" },
  { title: "Manage Assessments", desc: "Exams, Tests & Results", href: "/admin/academics/assessments", icon: FileBarChart, color: "bg-pink-100 text-pink-600" },
]

export default function AcademicsPage(){
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black">Academics</h1>
        <p className="text-sm text-gray-500 mt-1">Chagua kipengele unachotaka kusimamia</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c=>(
          <Link key={c.href} href={c.href} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}><c.icon size={22}/></div>
            <h3 className="font-bold mt-4">{c.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1d4ed8] group-hover:gap-2 transition-all">Open <ArrowRight size={14}/></div>
          </Link>
        ))}
      </div>
    </div>
  )
}