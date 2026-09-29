"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { User, Lock, ArrowLeft, Calculator } from "lucide-react"

type DbUser = {
  id: number | string
  name?: string | null
  email?: string | null
  password?: string | null
  description?: string | null
  phone?: string | null
  username?: string | null
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    localStorage.clear()
    sessionStorage.removeItem("hasLoginBeforeAdmin")
    window.history.replaceState(null, "", "/login")
  }, [])

  const findUserInTable = async (table: string, inputLower: string, inputRaw: string): Promise<DbUser | null> => {
    const { data } = await supabase.from(table).select("*").ilike("email", inputLower).limit(1).maybeSingle()
    if (data) return data as DbUser
    const { data: byName } = await supabase.from(table).select("*").ilike("name", inputLower).limit(1).maybeSingle()
    if (byName) return byName as DbUser
    try {
      const { data: byPhone } = await supabase.from(table).select("*").eq("phone", inputRaw).limit(1).maybeSingle()
      if (byPhone) return byPhone as DbUser
    } catch {}
    return null
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    try {
      const inputRaw = email.trim()
      const emailLower = inputRaw.toLowerCase()
      const passLower = password.trim().toLowerCase()
      const passRaw = password.trim()

      if (!inputRaw || !passRaw) throw new Error("Jaza username na password")

      if ((emailLower === "admin" && passLower === "admin123") || (emailLower === "mwalimu" && passLower === "mwalimu2026")) {
        localStorage.setItem("mwalimu_authed", "true")
        localStorage.setItem("mwalimu_role", "super admin")
        localStorage.setItem("mwalimu_admin_authed", "true")
        localStorage.setItem("mwalimu_admin_role", "super admin")
        localStorage.setItem("mwalimu_name", emailLower)
        localStorage.setItem("mwalimu_id", "0")
        document.cookie = `mwalimu_role=super admin; path=/; max-age=86400`
        router.push("/admin")
        return
      }

      let foundUser: DbUser | null = null
      for (const table of ["admins", "teachers", "students", "parents"]) {
        foundUser = await findUserInTable(table, emailLower, inputRaw)
        if (foundUser) break
      }
      if (!foundUser) throw new Error("Username / Email haipo")

      const dbPassLower = (foundUser.password || "").toString().toLowerCase().trim()
      const dbPassRaw = (foundUser.password || "").toString().trim()
      if (dbPassLower !== passLower && dbPassRaw !== passRaw) throw new Error("Password si sahihi")

      const role = (foundUser.description || "").toString().toLowerCase().trim()
      localStorage.setItem("mwalimu_authed", "true")
      localStorage.setItem("mwalimu_role", role)
      localStorage.setItem("mwalimu_admin_authed", "true")
      localStorage.setItem("mwalimu_admin_role", role)
      localStorage.setItem("mwalimu_id", String(foundUser.id))
      localStorage.setItem("mwalimu_name", foundUser.name || inputRaw)
      document.cookie = `mwalimu_role=${role}; path=/; max-age=86400`

      if (role.includes("super") || role === "admin") router.push("/admin")
      else if (role === "teacher") router.push("/teacher/dashboard")
      else if (role === "student") router.push("/student/dashboard")
      else if (role === "parent") router.push("/parent/dashboard")
      else router.push("/login")

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
          <div><label className="text-sm font-semibold">Username:</label><div className="relative mt-1.5"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="username" className="w-full pl-10 pr-3 py-2.5 border border-[#4F5AAE] rounded-lg text-sm outline-none"/></div></div>
          <div><label className="text-sm font-semibold">Password:</label><div className="relative mt-1.5"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none"/></div></div>
          {msg && <div className="text-xs p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">{msg}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#4F5AAE] text-white py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-[#3f4a9a] disabled:opacity-60">{loading?"...":"Log in"}</button>
        </form>
      </div>
      <div className="mt-5 text-center space-y-3">
        <p className="text-xs text-gray-500">Don&apos;t have an account? <Link href="/" className="text-[#4F5AAE] font-semibold hover:underline">Click here</Link></p>
        <Link href="/notes" className="inline-flex items-center gap-1.5 text-xs text-[#4F5AAE] font-medium hover:underline"><ArrowLeft size={14}/> Back to notes</Link>
      </div>
    </div>
  )
}