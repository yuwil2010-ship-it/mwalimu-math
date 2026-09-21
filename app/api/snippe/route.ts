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

    if (!process.env.SNIPPE_API_KEY) {
      throw new Error("SNIPPE_API_KEY missing in .env")
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimu-math.vercel.app"

    // 1. Tengeneza session kwenye Snippe
    const snippeRes = await fetch("https://api.snippe.sh/api/v1/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SNIPPE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount, // TZS kama integer, mfano 1000
        currency: "TZS",
        description: `${form} - ${topic}`,
        reference: reference, // order_number yako - muhimu kwa webhook
        allowed_methods: ["mobile_money", "card", "qr"],
        customer: {
          name: "Mwanafunzi",
          phone: phone, // 2557xxxxxxxx
        },
        redirect_url: `${siteUrl}/thank-you?reference=${encodeURIComponent(reference)}&topic=${encodeURIComponent(topic)}&form=${encodeURIComponent(form)}`,
        webhook_url: `${siteUrl}/api/webhooks/snippe`,
        metadata: {
          order_number: reference,
          topic,
          form,
        },
        expires_in: 3600, // session ina-expire baada ya saa 1
      }),
    })

    const json = await snippeRes.json()

    if (!snippeRes.ok) {
      console.error("Snippe error:", json)
      return NextResponse.json({ error: json.message || "Snippe failed" }, { status: 500 })
    }

    // Snippe inarudisha data.checkout_url na data.payment_link_url
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
