import "dotenv/config";
import { allowSubmission, getClientIp, sendContactEmail, validateContact } from "../server/contactService.js";
import { readSiteSettings } from "../server/siteSettingsService.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const ip = getClientIp(request);
  if (!allowSubmission(ip)) {
    return response.status(429).json({ ok: false, message: "Too many messages. Please try later." });
  }

  const payload = request.body || {};
  const errors = validateContact(payload);
  if (errors.length) {
    return response.status(400).json({ ok: false, errors });
  }

  try {
    const settings = await readSiteSettings();
    await sendContactEmail({ ...payload, mailTo: settings.socials.email });
    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(error.status || 500).json({ ok: false, message: "Email could not be sent." });
  }
}
