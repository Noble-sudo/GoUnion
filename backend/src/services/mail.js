import { env } from '../config/env.js';

// Render's free tier blocks outbound SMTP ports (25/465/587), so nodemailer
// can never reach smtp.resend.com from here. Resend's HTTP API works instead —
// it's plain HTTPS (443), which is never blocked.
const RESEND_API_KEY = env.smtp.pass; // Resend API key, already stored in SMTP_PASS
const RESEND_API_URL = 'https://api.resend.com/emails';

const hasResendConfig = () => Boolean(RESEND_API_KEY);
const isDevelopmentFallback = () => !hasResendConfig() && env.nodeEnv !== 'production';

export const sendMail = async ({ to, subject, text, html }) => {
  if (!hasResendConfig()) {
    console.warn(`[WARNING] Resend is not configured. Email to ${to} was skipped.`);
    console.log(`[mail:dev] ${subject} -> ${to}\n${text}`);
    return { skipped: true, dev: isDevelopmentFallback() };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.mailFrom,
        to: [to],
        subject,
        text,
        html,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`[mail] Resend API error ${res.status}: ${errBody}`);
      return { skipped: true, error: true };
    }

    return await res.json();
  } catch (err) {
    console.error('[mail] Failed to send via Resend:', err.message);
    return { skipped: true, error: true };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const sendWelcomeEmail = (user, verifyUrl) =>
  sendMail({
    to: user.email,
    subject: 'Confirm your GoUnion email',
    text: `Welcome to GoUnion. Confirm your email here: ${verifyUrl}`,
    html: `<p>Welcome to GoUnion.</p><p><a href="${verifyUrl}">Confirm your email</a></p>`,
  });

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const result = await sendMail({
    to: user.email,
    subject: 'Reset your GoUnion password',
    text: `Reset your GoUnion password here: ${resetUrl}\nThis link expires in 60 minutes.`,
    html: `<p>Reset your GoUnion password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 60 minutes.</p>`,
  });
  return result.dev ? { ...result, devResetUrl: resetUrl } : result;
};

export const sendOtpEmail = async (user, otp) => {
  const result = await sendMail({
    to: user.email,
    subject: 'Your GoUnion verification code',
    text: `Your GoUnion verification code is: ${otp}\nIt expires in 15 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0c;border-radius:16px;color:#fff;">
        <h2 style="margin:0 0 8px;font-size:24px;">Verify your GoUnion account</h2>
        <p style="color:#888;margin:0 0 32px;font-size:14px;">Enter this code in the app to confirm your email address.</p>
        <div style="letter-spacing:12px;font-size:40px;font-weight:900;text-align:center;padding:24px;background:#151518;border-radius:12px;border:1px solid #222;">${otp}</div>
        <p style="color:#555;font-size:12px;margin:24px 0 0;text-align:center;">Expires in 15 minutes &bull; Do not share this code</p>
      </div>`,
  });
  return result.dev ? { ...result, devCode: otp } : result;
};