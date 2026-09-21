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

  // Bucket sahihi kutoka screenshot yako ni topic-pdfs (na s)
  const bucket = "topic-pdfs"
  let cleanPath = filePath
  
  // Ondoa prefix kama file_path ina topic-pdfs/ au topic-pdf/ mbele
  if (filePath.startsWith("topic-pdfs/")) {
    cleanPath = filePath.replace("topic-pdfs/", "")
  } else if (filePath.startsWith("topic-pdf/")) {
    cleanPath = filePath.replace("topic-pdf/", "")
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, 60 * 5)

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ 
      error: `Failed to create signed URL! Bucket '${bucket}' path '${cleanPath}' not found. Original file_path: '${filePath}'. Error: ${signErr?.message}`,
      debug: { bucket, cleanPath, original: filePath, error: signErr?.message }
    }, { status: 404 })
  }

  return NextResponse.redirect(signed.signedUrl)
}
