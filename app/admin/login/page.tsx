"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { User, Lock, ArrowLeft, Calculator } from "lucide-react"

const ALLOWED_ADMINS = ["yuwil2010@gmail.com"]

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [msg, setMsg] = useState("")

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` }
        })
        if (error) throw error
        setMsg("Account imetengenezwa! Angalia email yako.")
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (ALLOWED_ADMINS.length > 0 && data.user &&!ALLOWED_ADMINS.includes(data.user.email || "")) {
          await supabase.auth.signOut()
          throw new Error("Email " + (data.user.email || "") + " hairuhusiwi Admin.")
        }
        router.push("/admin")
      }
    } catch (err: unknown) {
      const message = err instanceof Error? err.message : typeof err === "string"? err : "Kosa limetokea"
      setMsg(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` }
    })
    if (error) {
      setMsg(error.message)
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    if (!email) { setMsg("Andika username/email kwanza"); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`
    })
    if (error) setMsg(error.message)
    else setMsg("Link ya reset imetumwa.")
  }

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col items-center justify-center px-4">
      {/* LOGO - kama home page */}
      <div className="flex items-center gap-2 font-black text- text-[#1d4ed8] mb-5">
        <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center shadow-sm">
          <Calculator size={20} className="text-white" />
        </div>
        Mwalimu Math
      </div>

      {/* BOX - NUSU YA HORIZONTAL YA 340px -> 170px, IMEWEKWA KATI */}
      <div className="w-full max-w- mx-auto border border-gray-200 rounded- p-5 bg-white shadow-sm">
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="text- font-semibold text-gray-900">Username</label>
            <div className="relative mt-1.5">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-3 py-2.5 border border-[#4F5AAE] rounded-lg text- outline-none focus:ring-2 focus:ring-[#4F5AAE]/20"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text- font-semibold text-gray-900">Password</label>
              <button type="button" onClick={handleForgot} className="text- text-gray-500 hover:text-[#4F5AAE] hover:underline">
                Forgot password?
              </button>
            </div>
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text- outline-none focus:ring-2 focus:ring-[#4F5AAE]/20"
              />
            </div>
          </div>

          {msg && <div className="text- p-2.5 rounded-lg bg-gray-50 border text-gray-700 break-words">{msg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F5AAE] hover:bg-[#434a9a] text-white py-2.5 rounded-lg font-semibold text- disabled:opacity-50"
          >
            {loading? "..." : mode === "login"? "Log in" : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text- text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-gray-200 bg-white hover:bg-gray-50 py-2.5 rounded-lg text- font-medium flex items-center justify-center gap-2"
        >
          <span className="w-5 h-5 rounded-full border flex items-center justify-center text- font-black text-blue-600">G</span>
          Continue with Google
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text- text-gray-500">
          {mode === "login"? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login"? "signup" : "login")} className="text-[#4F5AAE] font-semibold hover:underline">
            {mode === "login"? "Create one" : "Log in"}
          </button>
        </p>
        <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text- text-[#4F5AAE] font-medium hover:underline">
          <ArrowLeft size={14} /> Back to website
        </Link>
      </div>
    </div>
  )
}