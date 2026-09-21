import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { reference, amount, phone, topic, form } = body as {
    reference: string
    amount: number
    phone: string
    topic: string
    form: string
  }

  // Tumia amount na phone ili ESLint isilalamike - hizi ndizo utazitumia ukiunganisha API halisi ya Snippe
  console.log(`[Snippe] Creating payment ${reference} - ${amount} TZS - ${phone}`)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimu-math.vercel.app"
  const redirectUrl = `${baseUrl}/thank-you?reference=${encodeURIComponent(reference)}&topic=${encodeURIComponent(topic)}&form=${encodeURIComponent(form)}`

  // TODO: Hapa ndipo utaweka API call yako halisi ya Snippe
  // const snippeRes = await fetch("https://api.snippe.io/checkout", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${process.env.SNIPPE_API_KEY}` },
  //   body: JSON.stringify({ reference, amount, phone, redirect_url: redirectUrl })
  // })
  // const { checkout_url } = await snippeRes.json()

  const checkout_url = redirectUrl // kwa testing - badilisha na checkout_url ya Snippe ukishapata API

  return NextResponse.json({ checkout_url })
}
