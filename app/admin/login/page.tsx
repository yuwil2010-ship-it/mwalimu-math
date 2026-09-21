"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Globe } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const ADMIN_PASS = "mwalimu2026"

  const t = {
    sw: { title: "Admin - Mwalimu Math", desc: "Ingiza password kuendelea", placeholder: "Password", login: "Ingia", back: "Back to Notes" },
    en: { title: "Admin - Mwalimu Math", desc: "Enter password to continue", placeholder: "Password", login: "Login", back: "Back to Notes" }
  }
  const tr = t[lang]

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      localStorage.setItem("mwalimu_admin_authed", "true")
      router.push("/admin")
    } else {
      alert(lang === 'sw'? "Password si sahihi!" : "Incorrect password!")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border p-8 w-full max-w-sm shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Link href="/notes" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#1d4ed8] border px-3 py-1.5 rounded-full bg-gray-50">
            <ArrowLeft size={14} /> {tr.back}
          </Link>
          <div className="flex items-center gap-1 bg-gray-100 border rounded-full px-3 py-1">
            <Globe size={14} />
            <select value={lang} onChange={(e)=> setLang(e.target.value as 'sw'|'en')} className="bg-transparent text-xs font-bold outline-none">
              <option value="sw">Kiswahili</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <h1 className="text-xl font-black mb-2">{tr.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{tr.desc}</p>
        <div className="relative">
          <input type={showPass? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={tr.placeholder} className="w-full border rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-[#1d4ed8]" onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3">{showPass? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <button onClick={handleLogin} className="w-full mt-4 bg-[#1d4ed8] text-white py-3 rounded-xl font-bold text-sm">{tr.login}</button>
      </div>
    </div>
  )
}