import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { deleteStoredReview, hasSupabase, insertStoredReview, listStoredReviews } from "./supabaseRest.js";

const storageDirectory = path.join(process.cwd(), "server", "storage");
const storageFile = path.join(storageDirectory, "reviews.json");
const reviewSubmissions = new Map();

export function validateReview(payload = {}) {
  const errors = [];
  if (payload.company) errors.push("Spam detected");
  if (payload.name && (payload.name.trim().length < 2 || payload.name.trim().length > 50)) errors.push("Valid name is required");
  if (!payload.comment || payload.comment.trim().length < 10 || payload.comment.trim().length > 500) errors.push("Review must be between 10 and 500 characters");
  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) errors.push("Rating must be between 1 and 5");
  if (payload.image && (!/^data:image\/(jpeg|png|webp);base64,/.test(payload.image) || payload.image.length > 480000)) errors.push("Image is invalid or too large");
  return errors;
}

export function allowReviewSubmission(ip = "unknown") {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (reviewSubmissions.get(ip) || []).filter((time) => now - time < windowMs);
  recent.push(now);
  reviewSubmissions.set(ip, recent);
  return recent.length <= 20;
}

export async function listReviews() {
  const reviews = await readReviews();
  return reviews
    .map(publicReview)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addReview(payload) {
  const reviews = await readReviews();
  const deleteKey = randomBytes(24).toString("hex");
  const review = {
    id: randomUUID(),
    name: payload.name?.trim() || "Client",
    comment: payload.comment.trim(),
    rating: payload.rating,
    image: payload.image || "",
    deleteHash: hashSecret(deleteKey),
    createdAt: new Date().toISOString()
  };
  reviews.unshift(review);
  if (hasSupabase()) {
    await insertStoredReview(review);
  } else if (process.env.VERCEL) {
    throw new Error("Supabase is not configured for review storage.");
  } else {
    await writeReviews(reviews.slice(0, 100));
  }
  return { ...publicReview(review), deleteKey };
}

export async function deleteReview(id, credential = {}) {
  const reviewId = Array.isArray(id) ? id[0] : String(id || "");
  const adminCode = (process.env.ADMIN_REVIEW_CODE || "").trim();
  const submittedAdminCode = String(credential.adminCode || "").trim();
  const canAdminDelete = adminCode && submittedAdminCode && secureCompare(adminCode, submittedAdminCode);

  if (canAdminDelete) {
    if (hasSupabase()) {
      const deleted = await deleteStoredReview(reviewId);
      return { ok: deleted, status: deleted ? 200 : 500 };
    }
    const reviews = await readReviews();
    await writeReviews(reviews.filter((item) => item.id !== reviewId));
    return { ok: true };
  }

  const reviews = await readReviews();
  const review = reviews.find((item) => item.id === reviewId);
  if (!review) return { ok: false, status: 404 };

  const submittedDeleteKey = String(credential.deleteKey || "").trim();
  const canClientDelete = review.deleteHash && submittedDeleteKey && secureCompare(review.deleteHash, hashSecret(submittedDeleteKey));

  if (!canClientDelete) return { ok: false, status: 403 };

  if (hasSupabase()) {
    const deleted = await deleteStoredReview(reviewId);
    if (!deleted) return { ok: false, status: 500 };
  } else {
    await writeReviews(reviews.filter((item) => item.id !== reviewId));
  }
  return { ok: true };
}

async function readReviews() {
  if (hasSupabase()) {
    const stored = await listStoredReviews();
    if (stored) return stored;
  }

  try {
    return JSON.parse(await readFile(storageFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeReviews(reviews) {
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(storageFile, JSON.stringify(reviews, null, 2), "utf8");
}

function publicReview(review) {
  const { deleteHash, ...safeReview } = review;
  return safeReview;
}

function hashSecret(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function secureCompare(first, second) {
  const firstBuffer = Buffer.from(String(first));
  const secondBuffer = Buffer.from(String(second));
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}
