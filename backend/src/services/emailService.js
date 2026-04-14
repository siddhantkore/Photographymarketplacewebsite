import nodemailer from 'nodemailer';

let cachedTransporter = null;

function isEmailConfigured() {
  return (
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS)
  );
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (!isEmailConfigured()) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT, 10),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

export async function sendOtpEmail({ email, otp, purpose }) {
  const subject =
    purpose === 'PASSWORD_RESET'
      ? 'Like Photo Studio password reset OTP'
      : 'Verify your email for Like Photo Studio';

  const intro =
    purpose === 'PASSWORD_RESET'
      ? 'Use this OTP to reset your password:'
      : 'Use this OTP to verify your account:';

  const text = `${intro} ${otp}. This OTP expires in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.4;">
      <h2>Like Photo Studio</h2>
      <p>${intro}</p>
      <p style="font-size: 22px; font-weight: 700; letter-spacing: 2px;">${otp}</p>
      <p>This OTP expires in 10 minutes.</p>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log(`[OTP:FALLBACK] email=${email} purpose=${purpose} — OTP redacted (configure SMTP to receive real codes)`);
    } else {
      console.error(`[OTP:FALLBACK] email=${email} — SMTP not configured. OTP delivery blocked.`);
    }
    return { sent: false, simulated: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text,
    html,
  });

  return { sent: true, simulated: false };
}
