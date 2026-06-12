const nodemailer = require("nodemailer");

const HOST = process.env.EMAIL_HOST;
const PORT = process.env.EMAIL_PORT;
const USER = process.env.EMAIL_USER;
const PASS = process.env.EMAIL_PASS;
const FROM = process.env.EMAIL_FROM || USER;

// Email is optional: without SMTP credentials the app logs the message
// instead of sending, so it runs fine in development.
const isConfigured = () => Boolean(HOST && USER && PASS);

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: Number(PORT) || 587,
      secure: Number(PORT) === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
};

// Fire-and-forget: emailing must never block or fail an API response.
const sendMail = ({ to, subject, html }) => {
  if (!isConfigured()) {
    console.log(`[email skipped — SMTP not configured] to=${to} subject="${subject}"`);
    return;
  }
  getTransporter()
    .sendMail({ from: FROM, to, subject, html })
    .then(() => console.log(`[email sent] to=${to} subject="${subject}"`))
    .catch((err) => console.log("[email failed]", err.message));
};

const wrap = (title, bodyHtml) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:20px 24px">
      <h1 style="color:#fff;margin:0;font-size:20px">Job<span style="color:#4cc9f0">Sphere</span></h1>
    </div>
    <div style="padding:24px;color:#2d3748">
      <h2 style="margin:0 0 12px 0;font-size:18px">${title}</h2>
      ${bodyHtml}
      <p style="margin-top:24px;color:#718096;font-size:13px">— The JobSphere Team</p>
    </div>
  </div>`;

const templates = {
  applicationReceived: (name, jobTitle) => ({
    subject: `Application received — ${jobTitle}`,
    html: wrap(
      `Hi ${name}, your application was received! ✅`,
      `<p>Thanks for applying for <strong>${jobTitle}</strong>. The recruiter has received your application and resume. We'll let you know about the next steps.</p>`
    ),
  }),
  shortlisted: (name, jobTitle) => ({
    subject: `You've been shortlisted — ${jobTitle}`,
    html: wrap(
      `Congratulations ${name}! 🎉`,
      `<p>You have been <strong>shortlisted</strong> for <strong>${jobTitle}</strong>. The recruiter may reach out to you soon. Keep an eye on your inbox and chat.</p>`
    ),
  }),
  rejected: (name, jobTitle) => ({
    subject: `Update on your application — ${jobTitle}`,
    html: wrap(
      `Hi ${name}, an update on your application`,
      `<p>Thank you for applying for <strong>${jobTitle}</strong>. After review, the recruiter has decided not to move forward at this time. We wish you the best and encourage you to keep applying.</p>`
    ),
  }),
};

module.exports = { isConfigured, sendMail, templates };
