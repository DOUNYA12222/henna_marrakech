import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { allowSubmission, getClientIp, sendContactEmail, validateContact } from "./contactService.js";
import { addReview, allowReviewSubmission, deleteReview, listReviews, validateReview } from "./reviewService.js";
import { readSiteSettings, writeSiteSettings } from "./siteSettingsService.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json({ limit: "1.5mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["POST", "GET", "DELETE", "PUT"]
  })
);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "henna_marrakech" });
});

app.get("/api/settings", async (_request, response) => {
  try {
    response.json({ ok: true, settings: await readSiteSettings() });
  } catch {
    response.status(500).json({ ok: false, message: "Settings could not be loaded." });
  }
});

app.put("/api/admin/settings", async (request, response) => {
  const result = await writeSiteSettings(request.body?.settings, request.body?.adminCode);
  if (!result.ok) {
    return response.status(result.status || 500).json({ ok: false, message: "Settings could not be saved." });
  }
  response.json({ ok: true, settings: result.settings });
});

app.post("/api/contact", async (request, response) => {
  const ip = getClientIp(request);
  if (!allowSubmission(ip)) {
    return response.status(429).json({ ok: false, message: "Too many messages. Please try later." });
  }

  const { name, email, phone, message, company } = request.body || {};
  const errors = validateContact({ name, email, message, company });
  if (errors.length) {
    return response.status(400).json({ ok: false, errors });
  }

  try {
    const settings = await readSiteSettings();
    await sendContactEmail({ name, email, phone, message, mailTo: settings.socials.email });
    response.json({ ok: true });
  } catch (error) {
    response.status(error.status || 500).json({ ok: false, message: "Email could not be sent." });
  }
});

app.get("/api/reviews", async (_request, response) => {
  try {
    response.json({ ok: true, reviews: await listReviews() });
  } catch {
    response.status(500).json({ ok: false, message: "Reviews could not be loaded." });
  }
});

app.post("/api/reviews", async (request, response) => {
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
    response.status(201).json({ ok: true, review });
  } catch (error) {
    console.error(error);
    const isSupabaseError = String(error?.message || "").includes("Supabase");
    response.status(500).json({
      ok: false,
      message: isSupabaseError
        ? "Supabase settings need checking in Vercel."
        : "Review could not be saved."
    });
  }
});

app.delete("/api/reviews", async (request, response) => {
  const result = await deleteReview(request.body?.id, request.body || {});
  if (!result.ok) {
    return response.status(result.status || 500).json({ ok: false, message: "Review could not be deleted." });
  }
  response.json({ ok: true });
});

app.delete("/api/reviews/:id", async (request, response) => {
  const result = await deleteReview(request.params.id, request.body || {});
  if (!result.ok) {
    return response.status(result.status || 500).json({ ok: false, message: "Review could not be deleted." });
  }
  response.json({ ok: true });
});

app.listen(port, () => {
  console.log(`henna_marrakech backend running on port ${port}`);
});
