import nodemailer from "nodemailer";

const submissions = new Map();

export function validateContact(payload = {}) {
  const errors = [];
  if (payload.company) errors.push("Spam detected");
  if (!payload.name || payload.name.trim().length < 2) errors.push("Name is required");
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push("Valid email is required");
  if (!payload.message || payload.message.trim().length < 10) errors.push("Message must be at least 10 characters");
  return errors;
}

export function allowSubmission(ip = "unknown") {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const record = submissions.get(ip) || [];
  const recent = record.filter((time) => now - time < windowMs);
  recent.push(now);
  submissions.set(ip, recent);
  return recent.length <= 4;
}

export async function sendContactEmail(payload) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error("Email service is not configured.");
    error.status = 503;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"henna_marrakech Website" <${process.env.SMTP_USER}>`,
    to: payload.mailTo || process.env.MAIL_TO || "ndounya8@gmail.com",
    replyTo: payload.email,
    subject: `New henna booking request from ${payload.name}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "Not provided"}`,
      "",
      payload.message
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#20140d">
        <h2>New henna_marrakech booking request</h2>
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(payload.phone || "Not provided")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>
      </div>
    `
  });
}

export function getClientIp(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0] || request.socket?.remoteAddress || "unknown";
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
