import { deleteReview } from "../../server/reviewService.js";

function readPayload(request) {
  const headerPayload = {
    adminCode: request.headers["x-admin-code"] || "",
    deleteKey: request.headers["x-delete-key"] || ""
  };
  if (!request.body) return headerPayload;
  if (typeof request.body === "string") {
    try {
      return { ...headerPayload, ...JSON.parse(request.body) };
    } catch {
      return headerPayload;
    }
  }
  return { ...headerPayload, ...request.body };
}

export default async function handler(request, response) {
  if (request.method !== "DELETE") {
    response.setHeader("Allow", "DELETE");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const result = await deleteReview(request.query.id, readPayload(request));
  if (!result.ok) {
    return response.status(result.status || 500).json({
      ok: false,
      message: result.status === 403
        ? "Admin code or delete key is invalid."
        : "Review could not be deleted."
    });
  }

  return response.status(200).json({ ok: true });
}
