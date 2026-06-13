import { addReview, allowReviewSubmission, deleteReview, listReviews, validateReview } from "../server/reviewService.js";
import { getClientIp } from "../server/contactService.js";

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
  if (request.method === "GET") {
    try {
      return response.status(200).json({ ok: true, reviews: await listReviews() });
    } catch {
      return response.status(500).json({ ok: false, message: "Reviews could not be loaded." });
    }
  }

  if (request.method === "DELETE") {
    const id = String(request.query?.id || request.url.split("/").pop() || "");
    const result = await deleteReview(id, readPayload(request));
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

  const payload = readPayload(request);
  const errors = validateReview(payload);
  if (errors.length) {
    return response.status(400).json({ ok: false, errors });
  }

  try {
    const review = await addReview(payload);
    return response.status(201).json({ ok: true, review });
  } catch {
    return response.status(500).json({ ok: false, message: "Review could not be saved." });
  }
}
