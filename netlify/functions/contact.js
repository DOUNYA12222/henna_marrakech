import "dotenv/config";
import { allowSubmission, sendContactEmail, validateContact } from "../../server/contactService.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed" });
  }

  const ip = event.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  if (!allowSubmission(ip)) {
    return json(429, { ok: false, message: "Too many messages. Please try later." });
  }

  const payload = JSON.parse(event.body || "{}");
  const errors = validateContact(payload);
  if (errors.length) {
    return json(400, { ok: false, errors });
  }

  try {
    await sendContactEmail(payload);
    return json(200, { ok: true });
  } catch (error) {
    return json(error.status || 500, { ok: false, message: "Email could not be sent." });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
