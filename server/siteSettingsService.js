import { mkdir, readFile, writeFile } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import path from "node:path";
import { galleryItems } from "../src/data/gallery.js";

const storageDirectory = path.join(process.cwd(), "server", "storage");
const storageFile = path.join(storageDirectory, "site-settings.json");

const defaultSettings = {
  socials: {
    whatsappNumber: "212641705725",
    displayPhone: "+212641705725",
    instagramHandle: "@henna__marrakech",
    instagramUrl: "https://www.instagram.com/henna__marrakech?igsh=dnlxMHlxZ2hpMmpn",
    tiktokHandle: "@violetta..dounya",
    tiktokUrl: "https://www.tiktok.com/@violetta..dounya?lang=en-GB&is_from_webapp=1&sender_device=mobile&sender_web_id=7607491732884194834",
    email: "ndounya8@gmail.com"
  },
  location: {
    label: "Riad Laârous, Bab Doukkala, Marrakech, Morocco",
    mapQuery: "Riad Laârous, Bab Doukkala, Marrakech, Morocco"
  },
  pricing: [
    { name: "Petite Henna", price: "50 DHS", desc: "Design delicat pour main, poignet ou detail minimal." },
    { name: "Medium Henna", price: "80-120 DHS", desc: "Motif plus complet, ideal pour sorties, voyage ou occasion speciale." },
    { name: "Grande Henna", price: "120-200 DHS", desc: "Composition riche pour bridal, shooting ou experience premium." }
  ],
  gallery: galleryItems
};

export async function readSiteSettings() {
  try {
    const stored = JSON.parse(await readFile(storageFile, "utf8"));
    return mergeSettings(stored);
  } catch (error) {
    if (error.code === "ENOENT") return defaultSettings;
    throw error;
  }
}

export async function writeSiteSettings(settings, adminCode) {
  if (!isAdmin(adminCode)) return { ok: false, status: 403 };
  const nextSettings = sanitizeSettings(settings);
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(storageFile, JSON.stringify(nextSettings, null, 2), "utf8");
  return { ok: true, settings: nextSettings };
}

function mergeSettings(settings = {}) {
  return {
    socials: { ...defaultSettings.socials, ...(settings.socials || {}) },
    location: { ...defaultSettings.location, ...(settings.location || {}) },
    pricing: Array.isArray(settings.pricing) && settings.pricing.length ? settings.pricing : defaultSettings.pricing,
    gallery: Array.isArray(settings.gallery) && settings.gallery.length ? settings.gallery : defaultSettings.gallery
  };
}

function sanitizeSettings(settings = {}) {
  const merged = mergeSettings(settings);
  return {
    socials: {
      whatsappNumber: clean(merged.socials.whatsappNumber, 24).replace(/[^\d]/g, "") || defaultSettings.socials.whatsappNumber,
      displayPhone: clean(merged.socials.displayPhone, 32),
      instagramHandle: clean(merged.socials.instagramHandle, 60),
      instagramUrl: cleanUrl(merged.socials.instagramUrl),
      tiktokHandle: clean(merged.socials.tiktokHandle, 60),
      tiktokUrl: cleanUrl(merged.socials.tiktokUrl),
      email: clean(merged.socials.email, 120)
    },
    location: {
      label: clean(merged.location.label, 180),
      mapQuery: clean(merged.location.mapQuery, 220)
    },
    pricing: merged.pricing.slice(0, 6).map((item) => ({
      name: clean(item.name, 80),
      price: clean(item.price, 40),
      desc: clean(item.desc, 220)
    })),
    gallery: merged.gallery.slice(0, 80).map((item, index) => ({
      id: item.id || `admin-${Date.now()}-${index}`,
      category: ["bridal", "hands", "feet", "modern", "moroccan", "luxury"].includes(item.category) ? item.category : "hands",
      title: clean(item.title, 80) || "Henna design",
      src: cleanImage(item.src)
    })).filter((item) => item.src)
  };
}

function clean(value = "", max = 120) {
  return String(value || "").trim().slice(0, max);
}

function cleanUrl(value = "") {
  const url = clean(value, 500);
  return /^https:\/\/.+/i.test(url) ? url : "";
}

function cleanImage(value = "") {
  const image = String(value || "").trim();
  if (image.startsWith("/assets/gallery/")) return image.slice(0, 500);
  if (/^data:image\/(jpeg|png|webp);base64,/i.test(image) && image.length < 950000) return image;
  return "";
}

function isAdmin(code = "") {
  const adminCode = process.env.ADMIN_REVIEW_CODE || process.env.ADMIN_CODE || "";
  if (!adminCode || !code) return false;
  const first = Buffer.from(String(adminCode));
  const second = Buffer.from(String(code));
  return first.length === second.length && timingSafeEqual(first, second);
}
