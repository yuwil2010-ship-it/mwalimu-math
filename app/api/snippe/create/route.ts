import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reference, amount, phone, topic, form } = body as {
      reference: string
      amount: number
      phone: string
      topic: string
      form: string
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimu-math.vercel.app"

    // DEMO MODE: Kama hakuna SNIPPE_API_KEY, ruka malipo ya kweli
    if (!process.env.SNIPPE_API_KEY) {
      console.log("DEMO MODE: SNIPPE_API_KEY missing, skipping real payment")
      const demoUrl = `${siteUrl}/thank-you?reference=${encodeURIComponent(reference)}&topic=${encodeURIComponent(topic)}&form=${encodeURIComponent(form)}&demo=true`
      return NextResponse.json({ checkout_url: demoUrl, demo: true })
    }

    // 1. Tengeneza session kwenye Snippe (hii inatumika tu kama kuna KEY)
    const snippeRes = await fetch("https://api.snippe.sh/api/v1/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SNIPPE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "TZS",
        description: `${form} - ${topic}`,
        reference: reference,
        allowed_methods: ["mobile_money", "card", "qr"],
        customer: {
          name: "Mwanafunzi",
          phone: phone,
        },
        redirect_url: `${siteUrl}/thank-you?reference=${encodeURIComponent(reference)}&topic=${encodeURIComponent(topic)}&form=${encodeURIComponent(form)}`,
        webhook_url: `${siteUrl}/api/webhooks/snippe`,
        metadata: {
          order_number: reference,
          topic,
          form,
        },
        expires_in: 3600,
      }),
    })

    const json = await snippeRes.json()

    if (!snippeRes.ok) {
      console.error("Snippe error:", json)
      return NextResponse.json({ error: json.message || "Snippe failed" }, { status: 500 })
    }

    const checkoutUrl = json.data?.checkout_url || json.data?.payment_link_url || json.checkout_url

    if (!checkoutUrl) {
      console.error("No checkout_url in response", json)
      return NextResponse.json({ error: "No checkout_url returned" }, { status: 500 })
    }

    return NextResponse.json({ checkout_url: checkoutUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("SNIPPE CREATE ERROR:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
