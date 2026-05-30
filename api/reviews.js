import { addReview, allowReviewSubmission, deleteReview, listReviews, validateReview } from "../server/reviewService.js";
import { getClientIp } from "../server/contactService.js";

export default async function handler(request, response) {
  if (request.method === "GET") {
    try {
      return response.status(200).json({ ok: true, reviews: await listReviews() });
    } catch {
      return response.status(500).json({ ok: false, message: "Reviews could not be loaded." });
    }
  }

  if (request.method === "DELETE") {
    const id = String(request.query?.id || request.url.split("/").pop() || "");
    const result = await deleteReview(id, request.body || {});
    if (!result.ok) {
      return response.status(result.status || 500).json({ ok: false, message: "Review could not be deleted." });
    }
    return response.status(200).json({ ok: true });
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST, DELETE");
    return response.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const ip = getClientIp(request);
  if (!allowReviewSubmission(ip)) {
    return response.status(429).json({ ok: false, message: "Too many reviews. Please try later." });
  }

  const errors = validateReview(request.body || {});
  if (errors.length) {
    return response.status(400).json({ ok: false, errors });
  }

  try {
    const review = await addReview(request.body);
    return response.status(201).json({ ok: true, review });
  } catch {
    return response.status(500).json({ ok: false, message: "Review could not be saved." });
  }
}
