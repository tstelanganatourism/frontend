import { NextRequest, NextResponse } from 'next/server';

// ── Simple in-memory rate limiter (per IP, resets on server restart) ─────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count += 1;
  return true;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PreBookingPayload {
  name: string;
  email: string;
  phone: string;
  packageName: string;
  packageId: string;
  date: string; // ISO string e.g. "2026-09-15"
  adults: number;
  children: number;
  notes?: string;
}

// ── Email HTML Templates ──────────────────────────────────────────────────────

function buildUserConfirmationEmail(data: PreBookingPayload): string {
  const travelDate = new Date(data.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  const totalPax = data.adults + (data.children || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pre-Booking Confirmed — TS Boat Tourism</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #030B1A; font-family: 'Inter', Arial, sans-serif; color: #e2e8f0; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #030B1A; }
  .hero { background: linear-gradient(135deg, #071A36 0%, #0F2847 50%, #071A36 100%); padding: 48px 40px 36px; text-align: center; border-bottom: 1px solid rgba(0,212,200,0.2); }
  .logo-text { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; color: #00D4C8; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
  .badge { display: inline-block; background: rgba(0,212,200,0.15); border: 1px solid rgba(0,212,200,0.4); color: #00D4C8; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 16px; border-radius: 100px; margin-bottom: 24px; }
  .hero h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 12px; }
  .hero p { font-size: 15px; color: #94a3b8; line-height: 1.6; }
  .content { padding: 40px; }
  .greeting { font-size: 17px; color: #e2e8f0; margin-bottom: 8px; font-weight: 600; }
  .intro { font-size: 14px; color: #94a3b8; line-height: 1.7; margin-bottom: 32px; }
  .booking-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(0,212,200,0.2); border-radius: 16px; overflow: hidden; margin-bottom: 32px; }
  .booking-card-header { background: linear-gradient(90deg, rgba(0,212,200,0.15), rgba(0,212,200,0.05)); padding: 16px 24px; border-bottom: 1px solid rgba(0,212,200,0.15); }
  .booking-card-header p { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; color: #00D4C8; letter-spacing: 2px; text-transform: uppercase; }
  .booking-rows { padding: 8px 0; }
  .booking-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .booking-row:last-child { border-bottom: none; }
  .row-label { font-size: 13px; color: #64748b; font-weight: 500; }
  .row-value { font-size: 14px; color: #e2e8f0; font-weight: 600; text-align: right; max-width: 60%; }
  .row-value.highlight { color: #00D4C8; }
  .steps-section { margin-bottom: 32px; }
  .steps-title { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 20px; }
  .step { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
  .step-num { flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #00D4C8, #0099a0); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 800; color: #030B1A; }
  .step-content h4 { font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 3px; }
  .step-content p { font-size: 13px; color: #64748b; line-height: 1.5; }
  .contact-card { background: rgba(245,176,22,0.08); border: 1px solid rgba(245,176,22,0.25); border-radius: 14px; padding: 24px; margin-bottom: 32px; }
  .contact-card h3 { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; color: #F5B016; margin-bottom: 14px; }
  .contact-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #cbd5e1; }
  .contact-item:last-child { margin-bottom: 0; }
  .contact-icon { font-size: 16px; }
  .cta-btn { display: block; background: linear-gradient(135deg, #00D4C8, #00a8a0); color: #030B1A; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800; text-align: center; padding: 16px 32px; border-radius: 12px; text-decoration: none; margin: 0 auto 32px; max-width: 280px; letter-spacing: 0.5px; }
  .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 0 40px 24px; }
  .footer { padding: 24px 40px 40px; text-align: center; }
  .footer p { font-size: 12px; color: #334155; line-height: 1.7; }
  .footer a { color: #00D4C8; text-decoration: none; }
  .footer .brand { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: #475569; margin-bottom: 8px; }
  @media (max-width: 480px) {
    .hero { padding: 36px 24px 28px; }
    .hero h1 { font-size: 26px; }
    .content { padding: 28px 24px; }
    .booking-row { flex-direction: column; align-items: flex-start; gap: 4px; }
    .row-value { text-align: left; max-width: 100%; }
    .footer { padding: 20px 24px 32px; }
  }
</style>
</head>
<body>
<div class="wrapper">
  <!-- Hero -->
  <div class="hero">
    <div class="logo-text">TS Boat Tourism</div>
    <div class="badge">✦ Pre-Booking Confirmed ✦</div>
    <h1>Your Slot is Reserved!<br/>We'll Be in Touch Soon.</h1>
    <p>Thank you for choosing TS Boat Tourism for your upcoming adventure.<br/>Your early access pre-booking has been received successfully.</p>
  </div>

  <!-- Content -->
  <div class="content">
    <p class="greeting">Dear ${data.name},</p>
    <p class="intro">We're thrilled to have you on board! 🚢 Your pre-booking for <strong style="color:#00D4C8">${data.packageName}</strong> has been registered. Our team will personally reach out to you to confirm availability, discuss details, and guide you through the next steps.<br/><br/>This is a <strong>FREE early pre-booking</strong> — no payment required now. Slots are limited and subject to availability.</p>

    <!-- Booking Summary Card -->
    <div class="booking-card">
      <div class="booking-card-header">
        <p>Your Pre-Booking Summary</p>
      </div>
      <div class="booking-rows">
        <div class="booking-row">
          <span class="row-label">Package Selected</span>
          <span class="row-value highlight">${data.packageName}</span>
        </div>
        <div class="booking-row">
          <span class="row-label">Preferred Travel Date</span>
          <span class="row-value">${travelDate}</span>
        </div>
        <div class="booking-row">
          <span class="row-label">Travellers</span>
          <span class="row-value">${data.adults} Adult${data.adults !== 1 ? 's' : ''}${data.children > 0 ? ` + ${data.children} Child${data.children !== 1 ? 'ren' : ''}` : ''} (${totalPax} total)</span>
        </div>
        <div class="booking-row">
          <span class="row-label">Contact Email</span>
          <span class="row-value">${data.email}</span>
        </div>
        <div class="booking-row">
          <span class="row-label">Contact Phone</span>
          <span class="row-value">${data.phone}</span>
        </div>
        ${data.notes ? `<div class="booking-row">
          <span class="row-label">Special Requests</span>
          <span class="row-value">${data.notes}</span>
        </div>` : ''}
        <div class="booking-row">
          <span class="row-label">Pre-Booking Status</span>
          <span class="row-value" style="color:#22c55e; font-weight:700;">✓ Registered Successfully</span>
        </div>
      </div>
    </div>

    <!-- What Happens Next -->
    <div class="steps-section">
      <p class="steps-title">What Happens Next?</p>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-content">
          <h4>We Review Your Slot</h4>
          <p>Our team checks availability for your chosen date and package within 24 hours.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-content">
          <h4>Personal Confirmation Call</h4>
          <p>You'll receive a call or WhatsApp message from our team to confirm and discuss your trip details.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-content">
          <h4>Lock In Your Booking</h4>
          <p>Once confirmed, you'll complete the formal booking and payment through our secure platform.</p>
        </div>
      </div>
    </div>

    <!-- Contact Card -->
    <div class="contact-card">
      <h3>📞 Reach Us Directly</h3>
      <div class="contact-item"><span class="contact-icon">📱</span><span>+91 99513 69573 (Call / WhatsApp)</span></div>
      <div class="contact-item"><span class="contact-icon">📧</span><span>tstelanganatourism@gmail.com</span></div>
      <div class="contact-item"><span class="contact-icon">📍</span><span>Om Shanthi Building, Kalyana Mandapam Road, Near SBI ATM, Bhadrachalam — 507111, Telangana</span></div>
      <div class="contact-item"><span class="contact-icon">🕗</span><span>Open 7 Days a Week · 7:00 AM – 9:00 PM IST</span></div>
    </div>

    <!-- CTA -->
    <a href="https://www.tstelanganatourism.com" class="cta-btn">Explore More Packages →</a>
  </div>

  <div class="divider"></div>

  <!-- Footer -->
  <div class="footer">
    <p class="brand">TS Boat Tourism</p>
    <p>This email was sent because you submitted a pre-booking request on<br/>
    <a href="https://www.tstelanganatourism.com/prebooking">tstelanganatourism.com/prebooking</a>.<br/><br/>
    If this wasn't you, please contact us immediately at<br/>
    <a href="mailto:tstelanganatourism@gmail.com">tstelanganatourism@gmail.com</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

function buildAdminNotificationEmail(data: PreBookingPayload): string {
  const travelDate = new Date(data.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
  const totalPax = data.adults + (data.children || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Pre-Booking Lead — TS Boat Tourism Admin</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0f172a; font-family: Arial, sans-serif; color:#e2e8f0; }
  .wrapper { max-width:600px; margin:0 auto; background:#0f172a; }
  .header { background:linear-gradient(135deg,#1e3a5f,#0f2847); padding:32px 36px; border-bottom:2px solid #00D4C8; }
  .header p.label { font-size:11px; color:#00D4C8; letter-spacing:3px; text-transform:uppercase; font-weight:700; margin-bottom:8px; }
  .header h1 { font-size:26px; font-weight:800; color:#ffffff; }
  .header .time { font-size:12px; color:#64748b; margin-top:8px; }
  .content { padding:32px 36px; }
  .lead-card { background:#1e293b; border:1px solid #00D4C8; border-radius:12px; overflow:hidden; margin-bottom:24px; }
  .lead-card-header { background:rgba(0,212,200,0.1); padding:12px 20px; }
  .lead-card-header p { font-size:11px; color:#00D4C8; letter-spacing:2px; text-transform:uppercase; font-weight:700; }
  .lead-row { display:flex; justify-content:space-between; align-items:flex-start; padding:12px 20px; border-top:1px solid rgba(255,255,255,0.06); gap:16px; }
  .lead-row .l { font-size:12px; color:#64748b; min-width:130px; }
  .lead-row .v { font-size:14px; color:#e2e8f0; font-weight:600; text-align:right; }
  .lead-row .v.highlight { color:#00D4C8; }
  .lead-row .v.green { color:#22c55e; }
  .action-note { background:rgba(245,176,22,0.1); border:1px solid rgba(245,176,22,0.3); border-radius:10px; padding:16px 20px; margin-bottom:24px; }
  .action-note p { font-size:13px; color:#F5B016; font-weight:600; margin-bottom:6px; }
  .action-note ul { font-size:13px; color:#94a3b8; padding-left:20px; line-height:1.8; }
  .footer { padding:20px 36px; text-align:center; border-top:1px solid rgba(255,255,255,0.08); }
  .footer p { font-size:11px; color:#334155; }
  @media (max-width:480px) {
    .header,.content { padding:24px 20px; }
    .lead-row { flex-direction:column; }
    .lead-row .v { text-align:left; }
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <p class="label">🆕 New Lead — Early Pre-Booking</p>
    <h1>Pre-Booking Request Received</h1>
    <p class="time">Submitted at: ${submittedAt} IST</p>
  </div>
  <div class="content">
    <div class="lead-card">
      <div class="lead-card-header"><p>Lead Details</p></div>
      <div class="lead-row"><span class="l">Customer Name</span><span class="v highlight">${data.name}</span></div>
      <div class="lead-row"><span class="l">Email Address</span><span class="v">${data.email}</span></div>
      <div class="lead-row"><span class="l">Phone Number</span><span class="v">${data.phone}</span></div>
      <div class="lead-row"><span class="l">Package Interested</span><span class="v highlight">${data.packageName}</span></div>
      <div class="lead-row"><span class="l">Preferred Date</span><span class="v">${travelDate}</span></div>
      <div class="lead-row"><span class="l">Adults</span><span class="v">${data.adults}</span></div>
      <div class="lead-row"><span class="l">Children</span><span class="v">${data.children || 0}</span></div>
      <div class="lead-row"><span class="l">Total Travellers</span><span class="v green">${totalPax} Pax</span></div>
      ${data.notes ? `<div class="lead-row"><span class="l">Special Notes</span><span class="v">${data.notes}</span></div>` : ''}
      <div class="lead-row"><span class="l">Source</span><span class="v">tstelanganatourism.com/prebooking</span></div>
    </div>

    <div class="action-note">
      <p>⚡ Action Required</p>
      <ul>
        <li>Contact the customer within 24 hours to confirm slot availability</li>
        <li>Call or WhatsApp: <strong>${data.phone}</strong></li>
        <li>Reply to: <strong>${data.email}</strong></li>
        <li>Check ${data.packageName} availability for <strong>${travelDate}</strong></li>
      </ul>
    </div>
  </div>
  <div class="footer">
    <p>TS Boat Tourism · Admin Alert · tstelanganatourism@gmail.com</p>
  </div>
</div>
</body>
</html>`;
}

// ── POST Handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  let body: PreBookingPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  // Validation
  const { name, email, phone, packageName, packageId, date, adults, children = 0, notes } = body;

  if (!name?.trim() || name.trim().length < 2) {
    return NextResponse.json({ success: false, message: 'Please enter a valid name (min 2 chars).' }, { status: 400 });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!phone?.trim() || phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ success: false, message: 'Please enter a valid phone number.' }, { status: 400 });
  }
  if (!packageName?.trim() || !packageId?.trim()) {
    return NextResponse.json({ success: false, message: 'Please select a package.' }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ success: false, message: 'Please select a preferred travel date.' }, { status: 400 });
  }
  // Date must be in September 2026
  const selectedDate = new Date(date);
  const minDate = new Date('2026-09-01');
  const maxDate = new Date('2026-09-30');
  if (selectedDate < minDate || selectedDate > maxDate) {
    return NextResponse.json(
      { success: false, message: 'Date must be within September 2026.' },
      { status: 400 }
    );
  }
  if (!adults || adults < 1 || adults > 50) {
    return NextResponse.json({ success: false, message: 'Number of adults must be between 1 and 50.' }, { status: 400 });
  }

  const cleanData: PreBookingPayload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    packageName: packageName.trim(),
    packageId: packageId.trim(),
    date,
    adults,
    children: children || 0,
    notes: notes?.trim() || '',
  };

  // Brevo API Key from env
  const BREVO_API_KEY = process.env.BREVO_API_KEY_USER || process.env.BREVO_API_KEY || '';
  const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'tstelanganatourism@gmail.com';
  const ADMIN_EMAIL = 'tstelanganatourism@gmail.com';

  if (!BREVO_API_KEY) {
    console.error('[Prebooking] BREVO_API_KEY not configured');
    return NextResponse.json(
      { success: false, message: 'Email service not configured. Please contact us directly.' },
      { status: 500 }
    );
  }

  const userEmailHtml = buildUserConfirmationEmail(cleanData);
  const adminEmailHtml = buildAdminNotificationEmail(cleanData);

  async function sendBrevoEmail(to: string, toName: string, subject: string, htmlContent: string) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: FROM_EMAIL, name: 'TS Boat Tourism' },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Brevo API error ${res.status}: ${errText}`);
    }
    return res;
  }

  try {
    // Send both emails concurrently
    await Promise.all([
      sendBrevoEmail(
        cleanData.email,
        cleanData.name,
        `✅ Pre-Booking Confirmed — ${cleanData.packageName} | TS Boat Tourism`,
        userEmailHtml
      ),
      sendBrevoEmail(
        ADMIN_EMAIL,
        'TS Boat Tourism Admin',
        `🆕 New Pre-Booking Lead — ${cleanData.name} | ${cleanData.packageName}`,
        adminEmailHtml
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Pre-booking confirmed! Check your email for details.',
    });
  } catch (err) {
    console.error('[Prebooking] Email send failed:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send confirmation email. Please try again or contact us directly.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Pre-Booking API is live. Use POST to submit.' });
}
