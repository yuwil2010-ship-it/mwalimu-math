import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function sendSMS(phone: string, message: string) {
  // TODO: weka API ya Beem au NextSMS yako hapa
  // kwa sasa ina-log tu
  console.log(`SMS kwenda ${phone}: ${message}`)
  return true
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    console.log("Snippe webhook:", data)

    const reference = data.reference || data.order_id
    const isPaid = data.status === "PAID" || data.payment_status === "success" || data.status === "success"

    if (isPaid && reference) {
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("reference", reference)
        .single()

      await supabase.from("orders").update({
        status: "paid",
        paid_at: new Date().toISOString()
      }).eq("reference", reference)

      if (order?.phone) {
        await sendSMS(
          order.phone,
          `Mwalimu Math: Malipo ya ${order.topic || "notes"} yamefanikiwa! Pakua: https://mwalimu-math.vercel.app/download/${reference}`
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}