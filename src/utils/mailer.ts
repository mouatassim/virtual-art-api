import { Resend } from "resend";
import nodemailer from "nodemailer";

const APP_URL = process.env.APP_URL ?? "http://localhost:5173";
const FROM = process.env.EMAIL_FROM ?? "Virtual Art <noreply@virtual-art.app>";

export function assertMailerConfigured(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "[mailer] RESEND_API_KEY is required in production but is not set.",
    );
  }
  if (!process.env.APP_URL) {
    throw new Error(
      "[mailer] APP_URL is required in production but is not set.",
    );
  }
}

// ─── In-memory rate limiter ───────────────────────────────────────────────────

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 3;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function checkResendRateLimit(email: string): void {
  const key = email.toLowerCase();
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return;
  }
  if (entry.count >= RATE_MAX) {
    throw Object.assign(
      new Error("Too many requests. Please wait before requesting a new link."),
      { statusCode: 429 },
    );
  }
  entry.count++;
}

// ─── Transport ───────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
    if (error) {
      console.error("[mailer] Resend error", { code: error.name, message: error.message, to });
      throw Object.assign(
        new Error("We couldn't send the email. Please try again."),
        { statusCode: 502 },
      );
    }
    return;
  }

  if (process.env.SMTP_HOST) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: process.env.SMTP_SECURE === "true",
      ...(process.env.SMTP_USER && {
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      }),
    });
    await transport.sendMail({ from: FROM, to, subject, html, text });
    return;
  }

  console.log(`\n[MAIL] ─────────────────────────────────────`);
  console.log(`[MAIL] To:      ${to}`);
  console.log(`[MAIL] Subject: ${subject}`);
  console.log(`[MAIL] ${text}`);
  console.log(`[MAIL] ─────────────────────────────────────\n`);
}

// ─── Templates ───────────────────────────────────────────────────────────────

const wrap = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:8px;padding:40px 36px;border:1px solid #e5e7eb">
        <tr><td>
          <p style="margin:0 0 28px;font-size:20px;font-weight:700;color:#111827">Virtual Art</p>
          ${body}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="color:#9ca3af;font-size:12px">Virtual Art · ${APP_URL}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (link: string, label: string) => `
  <p style="text-align:center;margin:2rem 0">
    <a href="${link}" style="background:#1b1a19;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">${label}</a>
  </p>
  <p style="color:#6b7280;font-size:13px;text-align:center">
    Or paste this link in your browser:<br>
    <a href="${link}" style="color:#1b1a19;word-break:break-all">${link}</a>
  </p>`;

export async function sendRegistrationEmail(to: string, token: string): Promise<void> {
  const link = `${APP_URL}/auth/activate?token=${token}`;
  const subject = "Activate your Virtual Art account";
  const html = wrap(`
    <h2 style="margin:0 0 12px;font-size:22px;color:#111827">Welcome to Virtual Art!</h2>
    <p style="color:#374151;line-height:1.6">
      Your account has been created.<br>
      Click below to set your password and open your first exhibition.
    </p>
    ${btn(link, "Activate my account")}
    <p style="color:#6b7280;font-size:13px">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
  `);
  const text = `Welcome to Virtual Art!\n\nActivate your account: ${link}\n\nThis link expires in 24 hours.`;
  await send(to, subject, html, text);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;
  const subject = "Reset your Virtual Art password";
  const html = wrap(`
    <h2 style="margin:0 0 12px;font-size:22px;color:#111827">Reset your password</h2>
    <p style="color:#374151;line-height:1.6">
      Click below to set a new password for your Virtual Art account.
    </p>
    ${btn(link, "Reset password")}
    <p style="color:#6b7280;font-size:13px">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
  `);
  const text = `Reset your Virtual Art password: ${link}\n\nThis link expires in 24 hours.`;
  await send(to, subject, html, text);
}
