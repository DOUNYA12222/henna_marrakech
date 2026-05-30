import { deleteReview } from "../../server/reviewService.js";

export default async function handler(request, response) {
  if (request.method !== "DELETE") {
    response.setHeader("Allow", "DELETE");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const result = await deleteReview(request.query.id, request.body || {});
  if (!result.ok) {
    return response.status(result.status || 500).json({ ok: false, message: "Review could not be deleted." });
  }

  return response.status(200).json({ ok: true });
}
