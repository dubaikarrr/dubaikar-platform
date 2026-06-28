import { NextResponse, type NextRequest } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { WEBINAR } from "@/lib/webinar";

export const runtime = "nodejs";

interface OrderBody {
  full_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  profession?: string;
  experience?: string;
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(request: NextRequest) {
  let body: OrderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName = (body.full_name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  if (fullName.length < 2 || !isEmail(email) || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "Please enter a valid name, email and phone." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Always capture the registration first, so no lead is ever lost, even if
  // payment is misconfigured or the user abandons checkout.
  const { data: reg, error: insertErr } = await admin
    .from("webinar_registrations")
    .insert({
      full_name: fullName,
      email,
      phone,
      city: body.city?.trim() || null,
      profession: body.profession?.trim() || null,
      experience: body.experience?.trim() || null,
      amount_inr: WEBINAR.priceInr,
      currency: WEBINAR.currency,
      status: "created",
    })
    .select("id")
    .single();

  if (insertErr || !reg) {
    console.error("webinar registration insert failed:", insertErr);
    return NextResponse.json({ error: "Could not save your registration. Please try again." }, { status: 500 });
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes("xxxx")) {
    // Registration saved; payments not wired yet. UI surfaces this gracefully.
    return NextResponse.json(
      { error: "Payments are opening soon, your spot is noted and we'll email you the payment link.", registrationId: reg.id, paymentsDisabled: true },
      { status: 503 },
    );
  }

  try {
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: WEBINAR.priceInr * 100, // paise
      currency: WEBINAR.currency,
      receipt: `webinar_${reg.id}`,
      notes: { registrationId: reg.id, email },
    });

    await admin
      .from("webinar_registrations")
      .update({ razorpay_order_id: order.id })
      .eq("id", reg.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      registrationId: reg.id,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  }
}
