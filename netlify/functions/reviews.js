import { addReview, allowReviewSubmission, deleteReview, listReviews, validateReview } from "../../server/reviewService.js";

export async function handler(event) {
  if (event.httpMethod === "GET") {
    try {
      return json(200, { ok: true, reviews: await listReviews() });
    } catch {
      return json(500, { ok: false, message: "Reviews could not be loaded." });
    }
  }

  if (event.httpMethod === "DELETE") {
    const id = event.path.split("/").filter(Boolean).pop();
    const payload = JSON.parse(event.body || "{}");
    const result = await deleteReview(id, payload);
    if (!result.ok) {
      return json(result.status || 500, { ok: false, message: "Review could not be deleted." });
    }
    return json(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed" }, { Allow: "GET, POST, DELETE" });
  }

  const ip = event.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  if (!allowReviewSubmission(ip)) {
    return json(429, { ok: false, message: "Too many reviews. Please try later." });
  }

  const payload = JSON.parse(event.body || "{}");
  const errors = validateReview(payload);
  if (errors.length) {
    return json(400, { ok: false, errors });
  }

  try {
    const review = await addReview(payload);
    return json(201, { ok: true, review });
  } catch {
    return json(500, { ok: false, message: "Review could not be saved." });
  }
}

function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  };
}
