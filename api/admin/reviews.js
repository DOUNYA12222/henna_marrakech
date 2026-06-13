import { deleteReviewAsAdmin } from "../../server/reviewService.js";

function readPayload(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return request.body;
}

export default async function handler(request, response) {
  if (request.method !== "DELETE") {
    response.setHeader("Allow", "DELETE");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const payload = readPayload(request);
    const result = await deleteReviewAsAdmin(payload.id, payload.adminCode);
    if (!result.ok) {
      return response.status(result.status || 500).json({
        ok: false,
        message: result.message || "Review could not be deleted."
      });
    }
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ ok: false, message: "Review could not be deleted." });
  }
}
