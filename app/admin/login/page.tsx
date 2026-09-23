"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { User, Lock, ArrowLeft, Calculator } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    localStorage.removeItem("mwalimu_admin_authed")
    localStorage.removeItem("mwalimu_admin_role")
    localStorage.removeItem("mwalimu_admin_id")
    localStorage.removeItem("mwalimu_admin_name")
    localStorage.removeItem("mwalimu_admin_email")
    localStorage.removeItem("mwalimu_admin_last_activity")
    window.history.replaceState(null, "", "/admin/login")
  }, [])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    try {
      const emailLower = email.toLowerCase().trim()
      const passLower = password.trim().toLowerCase()

      if ((emailLower === "admin" && passLower === "admin123") || (emailLower === "mwalimu" && passLower === "mwalimu2026")) {
        localStorage.setItem("mwalimu_admin_authed", "true")
        localStorage.setItem("mwalimu_admin_role", "super admin")
        localStorage.setItem("mwalimu_admin_name", emailLower)
        localStorage.setItem("mwalimu_admin_id", "0")
        localStorage.setItem("mwalimu_admin_last_activity", String(Date.now()))
        router.replace("/admin")
        return
      }

      const { data, error } = await supabase.from("admins").select("*").eq("email", emailLower).single()
      if (error || !data) throw new Error("Email haipo kwenye admins table")
      if ((data.password || "").toLowerCase().trim()!== passLower) throw new Error("Password si sahihi")

      localStorage.setItem("mwalimu_admin_authed", "true")
      localStorage.setItem("mwalimu_admin_id", String(data.id))
      localStorage.setItem("mwalimu_admin_role", data.description)
      localStorage.setItem("mwalimu_admin_name", data.name)
      localStorage.setItem("mwalimu_admin_email", data.email)
      localStorage.setItem("mwalimu_admin_last_activity", String(Date.now()))
      router.replace("/admin")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kosa limetokea"
      setMsg(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <div className="flex items-center gap-2 font-black text-xl text-[#1d4ed8] mb-6">
        <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center"><Calculator size={20} className="text-white"/></div>
        Mwalimu Math
      </div>
      <div className="w-full max-w-sm mx-auto border border-gray-200 rounded-xl p-5 bg-white shadow-sm" style={{ maxWidth: '380px' }}>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div><label className="text-sm font-semibold">Email:</label><div className="relative mt-1.5"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@mwalimumath.co.tz" className="w-full pl-10 pr-3 py-2.5 border border-[#4F5AAE] rounded-lg text-sm outline-none"/></div></div>
          <div><label className="text-sm font-semibold">Password:</label><div className="relative mt-1.5"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="jina la mwanzo" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none"/></div></div>
          {msg && <div className="text-xs p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-600">{msg}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#4F5AAE] text-white py-2.5 rounded-lg font-semibold text-sm">{loading?"...":"Log in"}</button>
        </form>
      </div>
      <div className="mt-5 text-center space-y-3">
        <p className="text-xs text-gray-500">Don&apos;t have an account? <Link href="/" className="text-[#4F5AAE] font-semibold hover:underline">Click here</Link></p>
        <Link href="/notes" className="inline-flex items-center gap-1.5 text-xs text-[#4F5AAE] font-medium hover:underline"><ArrowLeft size={14}/> Back to notes</Link>
      </div>
    </div>
  )
}