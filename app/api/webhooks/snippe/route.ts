import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  // hapa ndipo una-verify payment na ku-update Supabase yako
  console.log("Snippe webhook:", body)
  
  // mfano: update orders table is_paid = true
  // await supabase.from("orders").update({ status: "paid" }).eq("reference", body.reference)

  return NextResponse.json({ success: true })
}