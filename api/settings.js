import { readSiteSettings } from "../server/siteSettingsService.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    return response.status(200).json({ ok: true, settings: await readSiteSettings() });
  } catch {
    return response.status(500).json({ ok: false, message: "Settings could not be loaded." });
  }
}
