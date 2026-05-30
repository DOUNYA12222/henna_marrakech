import { writeSiteSettings } from "../../server/siteSettingsService.js";

export default async function handler(request, response) {
  if (request.method !== "PUT") {
    response.setHeader("Allow", "PUT");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const result = await writeSiteSettings(request.body?.settings, request.body?.adminCode);
  if (!result.ok) {
    return response.status(result.status || 500).json({ ok: false, message: "Settings could not be saved." });
  }

  return response.status(200).json({ ok: true, settings: result.settings });
}
