import { Resend } from "resend";

// Lazily constructed — RESEND_API_KEY may not be set locally, and we don't
// want to crash the whole server on import just because it's missing.
let resend = null;
const getClient = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
};

// Resend's shared test domain works with no DNS/domain setup — fine for a
// hackathon-scale app. Swap FROM_EMAIL once a verified sending domain exists.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "RelaySupport <onboarding@resend.dev>";

export const sendVerificationEmail = async (to, name, code) => {
  const client = getClient();
  if (!client) {
    // No API key configured — log the code so local development still
    // works end-to-end without a real inbox.
    console.log(`⚠️  RESEND_API_KEY not set — verification code for ${to}: ${code}`);
    return;
  }

  await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your RelaySupport account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f9d78;">Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Use this code to finish setting up your RelaySupport account. It expires in 15 minutes.</p>
        <p style="font-size: 32px; font-weight: 800; letter-spacing: 6px; background: #f0fdf9; color: #0f9d78; padding: 16px 20px; border-radius: 12px; text-align: center;">${code}</p>
        <p style="color: #666; font-size: 13px;">If you didn't try to create an account, you can ignore this email.</p>
      </div>
    `,
  });
};
