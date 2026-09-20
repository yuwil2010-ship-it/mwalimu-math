"use client"
import { useState } from "react"
import Link from "next/link"
import {
  BookOpen, CheckCircle2, Star, Mail, ArrowUp, MapPin, Phone,
  GraduationCap, Award, FileText, Sparkles, Users, BadgeCheck,
  Calculator, Globe
} from "lucide-react"

const kitabuData = [
  { form: "Form I", icon: BookOpen, topics: 12, bg: "from-blue-500 to-blue-600", symbols: ["π", "½", "△", "∑"] },
  { form: "Form II", icon: Calculator, topics: 11, bg: "from-blue-600 to-[#1d4ed8]", symbols: ["x²", "√", "θ", "a²+b²"] },
  { form: "Form III", icon: FileText, topics: 8, bg: "from-[#1d4ed8] to-blue-700", symbols: ["f(x)", "○", "≈", "∠"] },
  { form: "Form IV", icon: Award, topics: 8, bg: "from-blue-700 to-[#1e40af]", symbols: ["→", "P(A)", "[ ]", "∆"] },
  { form: "Form V", icon: GraduationCap, topics: 9, bg: "from-[#1e40af] to-[#1e3a8a]", symbols: ["d/dx", "∫", "lim", "∧∨"] },
  { form: "Form VI", icon: Sparkles, topics: 8, bg: "from-[#1e3a8a] to-blue-900", symbols: ["i", "σ", "∑", "∂"] },
  { form: "Mazoezi", icon: CheckCircle2, topics: 56, bg: "from-blue-700 to-[#172554]", symbols: ["✓", "?", "≠", "∞"] },
  { form: "Bonus", icon: BadgeCheck, topics: 15, bg: "from-[#1e3a8a] to-[#0B1E42]", symbols: ["2025", "2024", "2023", "NECTA"] },
]

const t = {
  sw: {
    huduma: "Huduma", badge: "Wanafunzi 100+ wameipata",
    hero1: "Msaidie Mwanafunzi Wako", hero2: "Kufaulu Mathematics",
    heroDesc: "Nukuu kamili za Mathematics Form I-VI kulingana na syllabus ya Tanzania. PDF tayari kuchapisha na kufundishia nyumbani.",
    pakuaLong: "Pakua Sasa - TZS 1,000/topic", ofa: "Ofa ya Leo",
    pdf1: "PDF ya kuchapisha", pdf2: "Chagua topic unayohitaji tu", pdf3: "Pokea WhatsApp papo hapo",
    chagua: "Chagua Topic Sasa", nukuuTitle: "Nukuu zinazopatikana", nukuuDesc: "Kila kidato kimegawanywa kwa topic - Jumla 71 topics",
    view: "view notes →", jinsi: "Jinsi Inavyofanya Kazi",
    s1t: "Lipia kirahisi zaidi", s1d: "Chagua topic, kisha lipia kwa mitandao ya simu",
    s2t: "Pokea PDF WhatsApp", s2d: "PDF inatumwa moja kwa moja kwenye WhatApp yako ndani ya dakika chache",
    s3t: "Anza Kujisomea na kufanya mazoezi", s3d: "Chapisha au soma kwenye simu uanze mazoezi ya kukuwezesha kufaulu Mathematics",
    tayariTitle: "Uko Tayari Kuanza?", tayariDesc: "Chagua topic unayohitaji leo kwa TZS 1,000 tu", pakua: "Pakua Sasa",
  },
  en: {
    huduma: "Services", badge: "100+ Students Got It", hero1: "Help Your Student", hero2: "Excel in Mathematics",
    heroDesc: "Complete Mathematics Notes Form I-VI based on Tanzania syllabus. Ready to print PDF for home learning.",
    pakuaLong: "Download Now - TZS 1,000/topic", ofa: "Today's Offer", pdf1: "Printable PDF", pdf2: "Choose only the topic you need", pdf3: "Receive via WhatsApp instantly",
    chagua: "Choose Topic Now", nukuuTitle: "Available Notes", nukuuDesc: "Each class is divided by topic - Total 71 topics",
    view: "view notes →", jinsi: "How It Works", s1t: "Easy Payment", s1d: "Choose topic, then pay via mobile networks",
    s2t: "Receive PDF on WhatsApp", s2d: "PDF is sent directly to your WhatsApp within a few minutes",
    s3t: "Start Reading & Practicing", s3d: "Print or read on phone and start practicing to pass Mathematics",
    tayariTitle: "Ready to Start?", tayariDesc: "Choose the topic you need today for TZS 1,000 only", pakua: "Download Now",
  }
}

export default function HomePage() {
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const tr = t[lang]
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-50 bg-[#1d4ed8] border-b border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl text-white">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center"><Calculator size={20} className="text-[#1d4ed8]"/></div>
            Mwalimu Math
          </div>
          <div className="flex items-center gap-5">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-white">
              <a href="#ndani" className="hover:text-yellow-200">{tr.huduma}</a>
            </nav>
            <div className="relative flex items-center gap-1 bg-blue-600 border border-blue-500 rounded-full px-3 py-1">
              <Globe size={14} className="text-white"/>
              <select value={lang} onChange={(e)=> {const val = e.target.value; setLang(val === 'en'? 'en' : 'sw')}} className="bg-transparent text-white text-xs font-bold outline-none">
                <option value="sw" className="text-black">Kiswahili</option>
                <option value="en" className="text-black">English</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1d4ed8] px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Users size={14}/> {tr.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            {tr.hero1} <span className="text-[#1d4ed8]">{tr.hero2}</span>
          </h1>
          <p className="mt-3 text-gray-600 text-sm">{tr.heroDesc}</p>
          <div className="mt-5 flex gap-3">
            <Link href="/notes" className="bg-[#1d4ed8] text-white px-7 py-3 rounded-full font-bold text-sm">{tr.pakuaLong}</Link>
          </div>
        </div>
        <div className="bg-white border-2 border-blue-100 rounded-xl p-5 shadow-xl relative">
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text- font-black px-2.5 py-1 rounded-full">-50% OFF</div>
          <h3 className="font-bold">{tr.ofa}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#1d4ed8]">1,000</span>
            <span className="text-xs">TZS / topic</span>
            <span className="line-through text-gray-400 ml-auto text-xs">2,000</span>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs">
            <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-500"/>{tr.pdf1}</li>
            <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-500"/>{tr.pdf2}</li>
            <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-500"/>{tr.pdf3}</li>
          </ul>
          <Link href="/notes" className="mt-4 w-full bg-[#1d4ed8] text-white py-2.5 rounded-xl font-bold flex justify-center text-sm">{tr.chagua}</Link>
        </div>
      </section>

      {/* FRONT PAGE - BLUE VARIATION ONLY, ICON LEFT TOP, FORM CENTER */}
      <section id="ndani" className="bg-gray-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center">{tr.nukuuTitle}</h2>
          <p className="text-center text-gray-600 mt-1 text-sm">{tr.nukuuDesc}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {kitabuData.map((item) => (
              <div key={item.form} className="bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition group flex flex-col">
                <div className={`h-36 bg-gradient-to-br ${item.bg} relative flex items-center justify-center overflow-hidden`}>
                  {/* Formula background - low opacity, visible far */}
                  <div className="absolute inset-0 opacity-[0.18]">
                    <div className="absolute top-6 left-4 text-white text-3xl font-black rotate-12 blur-[0.5px]">{item.symbols[0]}</div>
                    <div className="absolute top-10 right-6 text-white text-xl font-bold -rotate-12 blur-[0.5px]">{item.symbols[1]}</div>
                    <div className="absolute bottom-10 left-6 text-white/70 text-lg blur-[0.3px]">{item.symbols[2]}</div>
                    <div className="absolute bottom-6 right-4 text-white/50 text-sm">{item.symbols[3]}</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl font-black opacity-[0.05]">∑</div>
                  </div>

                  {/* Icon kushoto juu - inabaki palepale */}
                  <div className="absolute top-3 left-3 z-20">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <item.icon size={18} className="text-[#1d4ed8]"/>
                    </div>
                  </div>

                  {/* Badge kulia juu sambamba na icon */}
                  <div className="absolute top-3 right-3 z-20">
                    <span className="text- bg-white/20 backdrop-blur text-white px-2.5 py-1 rounded-full font-bold border border-white/20">{item.topics} Topics</span>
                  </div>

                  {/* Jina la kidato katikati */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <h4 className="font-black text-white text-xl tracking-tight drop-shadow-sm">{item.form}</h4>
                  </div>
                </div>

                <div className="p-3.5 bg-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#1d4ed8]"></div>
                      <span className="text- font-bold text-gray-700">{item.topics} {lang === 'sw'? 'Mada' : 'Topics'}</span>
                    </div>
                    <Link href={`/notes?form=${item.form}`} className="text- font-black text-[#1d4ed8] group-hover:underline">{tr.view}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAYMENT - ALIGNED 2x2 GRID, SAME SIZE */}
      <section id="jinsi" className="py-10 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-extrabold text-center">{tr.jinsi}</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="border rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-[#1d4ed8] text-white rounded-full flex items-center justify-center mx-auto font-black text-sm">1</div>
            <h4 className="font-bold mt-3 text-sm">{tr.s1t}</h4>
            <p className="text-xs text-gray-600 mt-1.5">{tr.s1d}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {["M-Pesa", "Mixx by Yas", "Airtel Money", "HaloPesa"].map(m => (
                <div key={m} className="h-11 flex items-center justify-center text- font-bold border rounded-lg bg-gray-50 text-gray-700">
                  {m}
                </div>
              ))}
            </div>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-[#1d4ed8] text-white rounded-full flex items-center justify-center mx-auto font-black text-sm">2</div>
            <h4 className="font-bold mt-3 text-sm">{tr.s2t}</h4>
            <p className="text-xs text-gray-600 mt-1.5">{tr.s2d}</p>
          </div>
          <div className="border rounded-xl p-5 text-center">
            <div className="w-10 h-10 bg-[#1d4ed8] text-white rounded-full flex items-center justify-center mx-auto font-black text-sm">3</div>
            <h4 className="font-bold mt-3 text-sm">{tr.s3t}</h4>
            <p className="text-xs text-gray-600 mt-1.5">{tr.s3d}</p>
          </div>
        </div>
      </section>

      <section id="ushuhuda" className="bg-blue-50/50 py-10 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { name: "Asha J. - Form I", text: "Nilinunua topic 5 za kidato cha kwanza kwa 5,000 tu, nikafaulu B kwenye mtihani wa mwisho wa mwaka." },
            { name: "Baraka M. - Mzazi", text: "Nimependa mfumo wa kuchagua topic. Sihitaji kununua kitabu kizima. Naangalia madhaifu ya mwanangu kisha namnunulia." },
            { name: "Neema K. - Form VI", text: "Calculus notes ziko vizuri sana, step by step. Worth kila shilingi." },
          ].map((t,i)=>(
            <div key={i} className="bg-white p-5 rounded-xl border">
              <div className="flex text-yellow-400"><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/></div>
              <p className="mt-2 text-xs">{`"${t.text}"`}</p>
              <p className="mt-2 font-bold text-">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-10 px-4 text-center border-t">
        <h2 className="text-2xl md:text-3xl font-extrabold text-black">{tr.tayariTitle}</h2>
        <p className="mt-2 text-gray-700 text-sm">{tr.tayariDesc}</p>
        <Link href="/notes" className="inline-block mt-5 bg-[#1d4ed8] text-white px-8 py-3 rounded-full font-black text-sm">{tr.pakua}</Link>
      </section>

      <footer className="bg-[#0B1E42] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 font-black text-white"><div className="w-8 h-8 bg-white rounded flex items-center justify-center"><Calculator size={16} className="text-[#0B1E42]"/></div>Mwalimu Math</div>
            <p className="text- mt-2 text-blue-100">Tunasaidia wanafunzi wa Tanzania kufaulu Mathematics kwa nukuu rahisi na za kueleweka.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Links</h4>
            <ul className="mt-2 text-xs space-y-1.5 text-blue-100"><li><a href="https://www.necta.go.tz" target="_blank" className="hover:text-white">Necta</a></li><li><a href="https://www.moe.go.tz" target="_blank" className="hover:text-white">Wizara ya Elimu</a></li></ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Contact</h4>
            <ul className="mt-2 text-xs space-y-1.5 text-blue-100"><li className="flex gap-2"><Phone size={12}/>0757 800 420</li><li className="flex gap-2"><Mail size={12}/>yuwil2010@gmail.com</li><li className="flex gap-2"><MapPin size={12}/>P.O. Box 150 Mlandizi, Kibaha, Pwani</li></ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Location</h4>
            <iframe className="mt-2 w-full h-28 rounded-xl border-0" loading="lazy" src="https://maps.google.com/maps?q=Mlandizi%2C%20Kibaha%2C%20Pwani%2C%20Tanzania&t=&z=13&ie=UTF8&iwloc=&output=embed"></iframe>
          </div>
        </div>
        <div className="border-t border-blue-900 py-3 px-4 flex justify-between items-center max-w-7xl mx-auto text- text-blue-200">
          <span>© 2026 Mwalimu Math. All rights reserved.</span>
          <button onClick={scrollToTop} className="w-7 h-7 bg-white text-blue-900 rounded-full flex items-center justify-center"><ArrowUp size={12}/></button>
        </div>
      </footer>
    </main>
  )
}