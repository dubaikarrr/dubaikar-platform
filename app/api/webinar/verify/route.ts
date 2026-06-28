import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  registrationId?: string;
}

export async function POST(request: NextRequest) {
  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Payments not configured." }, { status: 503 });
  }

  // Verify the signature: HMAC-SHA256(order_id|payment_id) with the key secret.
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const admin = createAdminClient();

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));

  if (!valid) {
    await admin
      .from("webinar_registrations")
      .update({ status: "failed", razorpay_payment_id, razorpay_signature })
      .eq("id", registrationId)
      .eq("razorpay_order_id", razorpay_order_id);
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const { error } = await admin
    .from("webinar_registrations")
    .update({
      status: "paid",
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq("id", registrationId)
    .eq("razorpay_order_id", razorpay_order_id);

  if (error) {
    console.error("webinar mark-paid failed:", error);
    return NextResponse.json({ error: "Payment verified but saving failed, contact us." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    whatsappUrl: process.env.NEXT_PUBLIC_WEBINAR_WHATSAPP_URL ?? null,
  });
}
