import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params

  if (!reference) {
    return NextResponse.json({ error: "Reference missing" }, { status: 400 })
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, status, order_number")
    .eq("order_number", reference)
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found: " + reference }, { status: 404 })
  }

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("file_path")
    .eq("order_id", order.id)

  if (itemsErr || !items || items.length === 0) {
    return NextResponse.json({ error: "No files found for this order" }, { status: 404 })
  }

  const filePath = items[0].file_path
  if (!filePath) {
    return NextResponse.json({ error: "File path missing in database" }, { status: 404 })
  }

  // Bucket yako ni topic-pdf
  const bucket = "topic-pdf"
  let cleanPath = filePath
  
  // Kama file_path bado ina prefix ya bucket (topic-pdf/Form-IV/...), iondoe
  if (filePath.startsWith("topic-pdf/")) {
    cleanPath = filePath.replace("topic-pdf/", "")
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, 60 * 5)

  if (signErr || !signed?.signedUrl) {
    // Fallback: jaribu bucket notes kama file ipo huko
    const fallbackBucket = "notes"
    const { data: signed2, error: signErr2 } = await supabase.storage
      .from(fallbackBucket)
      .createSignedUrl(filePath, 60 * 5)
    
    if (signErr2 || !signed2?.signedUrl) {
      return NextResponse.json({ 
        error: `Failed to create signed URL! object not found. Tried bucket '${bucket}' with path '${cleanPath}' and bucket '${fallbackBucket}' with path '${filePath}'. Error: ${signErr?.message}`,
        tried: { bucket, cleanPath, fallbackBucket, filePath }
      }, { status: 404 })
    }
    return NextResponse.redirect(signed2.signedUrl)
  }

  return NextResponse.redirect(signed.signedUrl)
}
