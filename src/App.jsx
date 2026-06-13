import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Gem,
  ImagePlus,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Music2,
  Send,
  Sparkles,
  Star,
  Trash2,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import { galleryItems } from "./data/gallery";

const locales = { fr, ar, en };
const languageLabels = { fr: "FR", ar: "AR", en: "EN" };
const instagramUrl = "https://www.instagram.com/henna__marrakech?igsh=dnlxMHlxZ2hpMmpn";
const tiktokUrl = "https://www.tiktok.com/@violetta..dounya?lang=en-GB&is_from_webapp=1&sender_device=mobile&sender_web_id=7607491732884194834";
const defaultSiteSettings = {
  socials: {
    whatsappNumber: "212641705725",
    displayPhone: "+212641705725",
    instagramHandle: "@henna__marrakech",
    instagramUrl,
    tiktokHandle: "@violetta..dounya",
    tiktokUrl,
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
const showcaseAssets = [
  { id: "petite", src: "/assets/services/petite-character.webp" },
  { id: "medium", src: "/assets/services/medium-character.webp" },
  { id: "grande", src: "/assets/services/grande-character.webp" },
  { id: "feet", src: "/assets/services/feet-character.webp" }
];

function mergeSiteSettings(settings = {}) {
  return {
    socials: { ...defaultSiteSettings.socials, ...(settings.socials || {}) },
    location: { ...defaultSiteSettings.location, ...(settings.location || {}) },
    pricing: Array.isArray(settings.pricing) && settings.pricing.length ? settings.pricing : defaultSiteSettings.pricing,
    gallery: Array.isArray(settings.gallery) && settings.gallery.length ? settings.gallery : defaultSiteSettings.gallery
  };
}

function whatsappUrl(t, settings = defaultSiteSettings) {
  const number = settings.socials?.whatsappNumber || defaultSiteSettings.socials.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(t.whatsappMessage)}`;
}

function apiEndpoint(path) {
  const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (apiBase.includes(".netlify/functions")) return `${apiBase}${path.replace("/api", "")}`;
  return `${apiBase}${path}`;
}

function updateMeta(selector, attribute, value) {
  const tag = document.querySelector(selector);
  if (tag && value) tag.setAttribute(attribute, value);
}

function resizeReviewImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type.startsWith("image/")) return reject(new Error("Image required"));

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 360;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.68));
      };
      image.onerror = () => reject(new Error("Image failed"));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Image failed"));
    reader.readAsDataURL(file);
  });
}

function resizeAdminImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type.startsWith("image/")) return reject(new Error("Image required"));

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 980;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = () => reject(new Error("Image failed"));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Image failed"));
    reader.readAsDataURL(file);
  });
}

function readOwnedReviews() {
  try {
    return JSON.parse(localStorage.getItem("henna-owned-reviews") || "{}");
  } catch {
    return {};
  }
}

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const luxeReveal = {
  hidden: { opacity: 0, y: 46, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] } }
};

const luxeStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};

function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18, margin: "-70px" }}
      variants={{
        hidden: luxeReveal.hidden,
        visible: { ...luxeReveal.visible, transition: { ...luxeReveal.visible.transition, delay } }
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

function useLanguage() {
  const [lang, setLang] = useState(() => localStorage.getItem("henna-lang") || "fr");
  const t = locales[lang] || locales.fr;
  const isRtl = lang === "ar";

  useEffect(() => {
    localStorage.setItem("henna-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.title = t.metaTitle;
    updateMeta('meta[name="description"]', "content", t.metaDescription);
    updateMeta('meta[name="keywords"]', "content", t.metaKeywords);
    updateMeta('meta[property="og:title"]', "content", t.metaTitle);
    updateMeta('meta[property="og:description"]', "content", t.metaDescription);
    updateMeta('meta[property="og:locale"]', "content", lang === "fr" ? "fr_FR" : lang === "ar" ? "ar_MA" : "en_US");
    updateMeta('meta[name="twitter:title"]', "content", t.metaTitle);
    updateMeta('meta[name="twitter:description"]', "content", t.metaDescription);
  }, [lang, isRtl, t]);

  return { lang, setLang, t, isRtl };
}

function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSiteSettings);

  useEffect(() => {
    let active = true;
    fetch(apiEndpoint("/api/settings"))
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (active) setSettings(mergeSiteSettings(data.settings));
      })
      .catch(() => {
        if (active) setSettings(defaultSiteSettings);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, setSettings };
}

function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="luxury-loading-screen fixed inset-0 z-[100] grid place-items-center bg-night"
          exit={{ opacity: 0, transition: { duration: 0.7 } }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-gold/40 shadow-glow"
            >
              <Sparkles className="text-gold" size={28} />
            </motion.div>
            <p className="loading-brand-text font-display text-3xl font-bold tracking-normal">henna_marrakech</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const move = (event) => setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed z-[90] hidden h-28 w-28 rounded-full bg-gold/20 blur-3xl md:block"
      animate={{ x: position.x - 56, y: position.y - 56 }}
      transition={{ type: "spring", stiffness: 90, damping: 22, mass: 0.3 }}
    />
  );
}

function GlobalStarField() {
  const [stars, setStars] = useState([]);
  const [hiddenOnHome, setHiddenOnHome] = useState(true);

  useEffect(() => {
    const createStars = () => {
      const count = window.innerWidth < 700 ? 58 : 120;
      setStars(
        Array.from({ length: count }, (_, index) => ({
          id: index,
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          size: `${Math.random() * 3.2 + 1.6}px`,
          opacity: (Math.random() * 0.42 + 0.28).toFixed(2),
          depth: (Math.random() * 1.25 + 0.35).toFixed(2),
          delay: `${Math.random() * -4}s`
        }))
      );
    };

    const moveStars = (event) => {
      const directionX = (event.clientX / window.innerWidth - 0.5) * 2;
      const directionY = (event.clientY / window.innerHeight - 0.5) * 2;
      document.documentElement.style.setProperty("--stars-x", `${directionX * 18}px`);
      document.documentElement.style.setProperty("--stars-y", `${directionY * 14}px`);
      document.querySelectorAll(".global-star-particle").forEach((particle) => {
        const depth = Number(particle.dataset.depth || 1);
        particle.style.setProperty("--move-x", `${directionX * depth * 28}px`);
        particle.style.setProperty("--move-y", `${directionY * depth * 20}px`);
      });
    };

    const home = document.getElementById("home");
    const observer = home
      ? new IntersectionObserver(([entry]) => setHiddenOnHome(entry.isIntersecting), { threshold: 0.18 })
      : null;

    if (home && observer) observer.observe(home);
    createStars();
    window.addEventListener("resize", createStars);
    window.addEventListener("pointermove", moveStars);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", createStars);
      window.removeEventListener("pointermove", moveStars);
    };
  }, []);

  return (
    <div className={`global-star-field ${hiddenOnHome ? "is-hidden" : ""}`} aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="global-star-particle"
          data-depth={star.depth}
          style={{
            "--x": star.x,
            "--y": star.y,
            "--s": star.size,
            "--o": star.opacity,
            "--d": star.delay
          }}
        />
      ))}
    </div>
  );
}

function Navbar({ t, lang, setLang }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const links = [
    ["home", t.nav.home],
    ["gallery", t.nav.gallery],
    ["pricing", t.nav.pricing],
    ["testimonials", t.nav.testimonials],
    ["contact", t.nav.contact]
  ];

  useEffect(() => {
    const sections = links.map(([id]) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -58% 0px", threshold: 0.08 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navigate = (event, id) => {
    event.preventDefault();
    setActiveSection(id);
    setOpen(false);
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    target?.classList.remove("section-highlight");
    window.setTimeout(() => target?.classList.add("section-highlight"), 80);
    window.setTimeout(() => target?.classList.remove("section-highlight"), 1000);
  };

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-cream/10 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8" aria-label="Main navigation">
        <a href="#home" onClick={(event) => navigate(event, "home")} className="font-display text-xl font-bold text-cream">
          henna_<span className="text-gold">marrakech</span>
        </a>
        <div className="hidden items-center gap-7 lg:flex">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(event) => navigate(event, id)} className={`nav-link relative py-2 text-base font-semibold transition ${activeSection === id ? "is-active" : ""}`}>
              {label}
              {activeSection === id && <motion.span layoutId="nav-active-marker" className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-gold" />}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex" aria-label="Language switcher">
          {Object.keys(locales).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`dynamic-button h-9 rounded-full px-3 text-xs font-bold transition ${
                lang === code ? "bg-gold text-cream" : "border border-cream/15 text-cream/75 hover:border-gold/60"
              }`}
            >
              {languageLabels[code]}
            </button>
          ))}
        </div>
        <button className="dynamic-button grid h-10 w-10 place-items-center rounded-full border border-cream/15 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid h-[100dvh] place-items-center bg-night/88 p-4 text-cream backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 22 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-gold/30 bg-[#06111A] shadow-[0_28px_90px_rgba(0,0,0,.65)]"
            >
            <div className="absolute inset-0 opacity-30 moroccan-mask" />
            <div className="relative flex items-center justify-between border-b border-gold/15 px-6 py-5">
              <span className="font-display text-2xl font-bold">henna_<span className="text-gold">marrakech</span></span>
              <button className="dynamic-button grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-night/70 text-gold" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <div className="relative flex-1 overflow-y-auto px-7 py-7">
              <div className="grid gap-4">
              {links.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(event) => navigate(event, id)}
                  className={`font-display text-4xl font-bold leading-tight tracking-normal transition ${activeSection === id ? "text-gold" : "text-[#AC9D80]"}`}
                >
                  {label}
                </a>
              ))}
              </div>
              <div className="mt-8 border-t border-gold/20 pt-6">
                <p className="text-lg font-bold text-gold">Riad Laârous</p>
                <p className="mt-3 text-base font-semibold text-cream/80">Bab Doukkala, Marrakech</p>
              </div>
              <div className="mt-3">
                <p className="text-lg font-bold text-gold">Langue</p>
                <div className="mt-4 flex gap-2">
                  {Object.keys(locales).map((code) => (
                    <button key={code} onClick={() => { setLang(code); setOpen(false); }} className={`dynamic-button h-10 rounded-full px-4 text-sm font-bold ${lang === code ? "bg-gold text-cream" : "border border-gold/25 text-cream"}`}>
                      {languageLabels[code]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroBranches() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <motion.img
        src="/assets/decor/eucalyptus-branch.webp"
        alt=""
        className="hero-branch absolute left-1 bottom-24 w-24 opacity-85 sm:left-3 sm:w-32 md:bottom-16 md:w-40 lg:left-6 lg:w-48"
        style={{ transformOrigin: "bottom left" }}
        animate={{ rotate: [-1.5, 2, -1, 1.5, -1.5], x: [0, 3, 0, 2, 0] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img
        src="/assets/decor/eucalyptus-branch.webp"
        alt=""
        className="hero-branch absolute right-1 bottom-28 w-24 -scale-x-100 opacity-85 sm:right-3 sm:w-32 md:bottom-24 md:w-40 lg:right-6 lg:w-48"
        style={{ transformOrigin: "bottom right" }}
        animate={{ rotate: [1.5, -2, 1, -1.5, 1.5], x: [0, -3, 0, -2, 0] }}
        transition={{ duration: 7.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function CharacterShowcase({ t, compact = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = showcaseAssets[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % showcaseAssets.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, delay: 0.1 }} className="relative mx-auto w-full max-w-md">
      <div dir="ltr" className={`relative mx-auto overflow-hidden ${compact ? "h-[390px] lg:h-[500px]" : "h-[390px] sm:h-[500px] lg:h-[570px]"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 90, rotate: 2, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, x: -90, rotate: -2, scale: 0.97 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-end justify-center"
          >
            <img src={current.src} alt={t.showcase[current.id]} className="h-full w-full object-contain object-bottom drop-shadow-[0_20px_24px_rgba(23,17,10,0.22)]" />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${current.id}-label`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-cream/20 bg-night/70 px-5 py-2 font-display text-lg font-bold text-cream shadow-soft backdrop-blur-md"
          >
            {t.showcase[current.id]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button type="button" onClick={() => setActiveIndex((activeIndex + showcaseAssets.length - 1) % showcaseAssets.length)} className="dynamic-button grid h-10 w-10 place-items-center rounded-full border border-night/15 text-night transition hover:border-gold hover:text-gold" aria-label={t.showcase.previous}>
          <ChevronLeft size={18} />
        </button>
        {showcaseAssets.map((asset, index) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={t.showcase[asset.id]}
            className={`dynamic-button h-2 rounded-full transition-all ${index === activeIndex ? "w-9 bg-gold" : "w-2 bg-night/20 hover:bg-night/40"}`}
          />
        ))}
        <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % showcaseAssets.length)} className="dynamic-button grid h-10 w-10 place-items-center rounded-full border border-night/15 text-night transition hover:border-gold hover:text-gold" aria-label={t.showcase.next}>
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function Hero({ t, settings }) {
  const videoRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  const [videoLoopEnd, setVideoLoopEnd] = useState(null);

  const setTrimmedLoop = (event) => {
    const duration = event.currentTarget.duration;
    if (Number.isFinite(duration) && duration > 2.4) {
      setVideoLoopEnd(duration - 2);
    }
  };

  const keepVideoTrimmed = (event) => {
    if (videoLoopEnd && event.currentTarget.currentTime >= videoLoopEnd) {
      event.currentTarget.currentTime = 0;
      event.currentTarget.play().catch(() => {});
    }
  };

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    const nextSound = !soundOn;
    video.muted = !nextSound;
    if (nextSound) video.volume = 0.72;
    try {
      await video.play();
      setSoundOn(nextSound);
    } catch {
      video.muted = true;
      setSoundOn(false);
    }
  };

  return (
    <section id="home" className="relative min-h-[72vh] overflow-hidden bg-night px-4 pb-10 pt-24 text-cream md:min-h-[86vh] md:px-8 md:pb-20 md:pt-36">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center"
        src="/assets/video/henna-luxury-home.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={setTrimmedLoop}
        onTimeUpdate={keepVideoTrimmed}
      />
      <div className="absolute inset-0 bg-night/18" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(23,17,10,.18))]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#17110A]/80 to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[46vh] max-w-7xl items-center justify-center md:min-h-[58vh]">
        <motion.div initial="hidden" animate="visible" variants={reveal} className="mx-auto max-w-4xl text-center">
          <button
            type="button"
            onClick={toggleSound}
            className="dynamic-button mb-3 inline-flex items-center gap-2 rounded-full border border-cream/20 bg-night/75 px-3 py-2 text-xs font-bold text-cream shadow-soft backdrop-blur-xl md:px-4 md:text-sm"
            aria-label={soundOn ? "Mute video" : "Activate video sound"}
          >
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            {soundOn ? "Sound On" : "Sound"}
          </button>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cream/25 bg-night/50 px-3 py-2 text-xs text-cream shadow-soft backdrop-blur-md md:mb-5 md:px-4 md:text-sm">
            <Gem size={16} />
            {t.hero.eyebrow}
          </div>
          <h1 dir="ltr" className="font-display text-[2.05rem] font-extrabold leading-[.98] tracking-normal min-[380px]:text-[2.55rem] sm:text-6xl lg:text-8xl">
            <span className="video-gold-text">{t.hero.title}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-cream md:mt-5 md:text-lg md:leading-7">{t.hero.subtitle}</p>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, repeat: Infinity }} className="mt-4 inline-flex rounded-full border border-cream/25 bg-night/50 px-4 py-2 text-xs font-semibold text-cream backdrop-blur-md md:mt-5 md:px-5 md:py-2.5 md:text-sm">
            {t.hero.badge}
          </motion.div>
          <div className="mx-auto mt-6 flex max-w-[22rem] flex-col justify-center gap-3 sm:max-w-none sm:flex-row md:mt-7">
            <a href={whatsappUrl(t, settings)} target="_blank" rel="noreferrer" className="dynamic-button group inline-flex items-center justify-center gap-3 rounded-full bg-gold px-5 py-3.5 text-sm font-bold text-cream shadow-glow md:px-7 md:py-4 md:text-base">
              <MessageCircle size={20} />
              {t.hero.book}
              <ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1" size={18} />
            </a>
            <a href="#design-choice" className="dynamic-button inline-flex items-center justify-center gap-3 rounded-full border border-night/15 bg-white/60 px-5 py-3.5 text-sm font-bold text-night backdrop-blur-xl hover:border-gold/70 hover:text-gold md:px-7 md:py-4 md:text-base">
              <Camera size={20} />
              {t.hero.view}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DesignChoice({ t, settings }) {
  const [selected, setSelected] = useState("petite");
  const [custom, setCustom] = useState("");
  const options = ["petite", "medium", "grande", "feet", "custom"];
  const selectedText = selected === "custom" ? custom.trim() || t.designChoice.custom : t.showcase[selected];
  const message = `${t.whatsappMessage}\n\n${t.designChoice.messageLabel}: ${selectedText}`;
  const bookingUrl = `https://wa.me/${settings.socials.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section id="design-choice" className="soft-luxury-section relative px-4 pb-20 pt-16 md:px-8">
      <SectionHeading eyebrow={t.designChoice.eyebrow} title={t.designChoice.title} copy={t.designChoice.copy} />
      <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[1.25fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, x: -80, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-[390px] flex-col justify-between luxury-cream-card rounded-lg border border-night/10 p-5 backdrop-blur-xl md:p-8 lg:min-h-[500px]"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`dynamic-button min-h-14 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                  selected === option ? "border-gold bg-gold text-cream shadow-glow" : "border-night/10 bg-white/55 text-night hover:border-gold"
                }`}
              >
                {option === "custom" ? t.designChoice.custom : t.showcase[option]}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {selected === "custom" && (
              <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-5 block overflow-hidden">
                <span className="mb-2 block text-sm font-bold text-night/70">{t.designChoice.customLabel}</span>
                <textarea
                  value={custom}
                  onChange={(event) => setCustom(event.target.value)}
                  rows="3"
                  placeholder={t.designChoice.placeholder}
                  className="w-full rounded-lg border border-night/12 bg-white/75 px-4 py-3 text-night outline-none transition placeholder:text-night/40 focus:border-gold"
                />
              </motion.label>
            )}
          </AnimatePresence>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-night/10 pt-5 sm:flex-row sm:items-center">
            <p className="text-sm text-night/65">
              {t.designChoice.selected}: <strong className="text-henna">{selectedText}</strong>
            </p>
            <a href={bookingUrl} target="_blank" rel="noreferrer" className="dynamic-button inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-cream shadow-glow">
              <MessageCircle size={18} />
              {t.designChoice.send}
            </a>
          </div>
        </motion.div>
        <div className="mt-3 lg:-mt-8">
          <CharacterShowcase t={t} compact />
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, copy, tone = "light" }) {
  const titleColor = tone === "dark" ? "text-night" : "text-cream";
  const copyColor = tone === "dark" ? "text-night/70" : "text-cream/70";

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={luxeStagger} className="mx-auto mb-12 max-w-3xl text-center">
      <motion.p variants={luxeReveal} className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-gold">{eyebrow}</motion.p>
      <motion.h2 variants={luxeReveal} className={`font-display text-4xl font-bold tracking-normal md:text-5xl ${titleColor}`}>{title}</motion.h2>
      {copy && <motion.p variants={luxeReveal} className={`mt-5 text-base leading-7 md:text-lg ${copyColor}`}>{copy}</motion.p>}
    </motion.div>
  );
}

function Gallery({ t, settings }) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const categories = ["all", "bridal", "hands", "feet", "modern", "moroccan", "luxury"];
  const sourceItems = settings.gallery.length ? settings.gallery : galleryItems;
  const items = filter === "all" ? sourceItems : sourceItems.filter((item) => item.category === filter);

  return (
    <section id="gallery" className="soft-luxury-section relative px-4 py-24 md:px-8">
      <SectionHeading eyebrow={t.sections.galleryEyebrow} title={t.sections.galleryTitle} copy={t.sections.galleryCopy} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={luxeStagger} className="mx-auto mb-10 flex max-w-5xl flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <motion.button variants={luxeReveal} key={category} onClick={() => setFilter(category)} className={`dynamic-button rounded-full px-4 py-2 text-sm font-bold transition ${filter === category ? "bg-gold text-cream" : "border border-gold/25 text-gold hover:border-gold/60 hover:bg-gold/15"}`}>
            {t.gallery[category]}
          </motion.button>
        ))}
      </motion.div>
      <motion.div layout className="masonry mx-auto max-w-6xl">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.button
              layout
              key={item.id}
              initial={{ opacity: 0, y: 44, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.18 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setActive(item)}
              className="masonry-item group w-full overflow-hidden rounded-lg border border-night/10 bg-white/60 text-left shadow-soft"
            >
              <img loading="lazy" src={item.src} alt={`${item.title} henna design`} className="h-auto w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="flex items-center justify-between p-4">
                <span className="font-display text-xl text-night">{item.title}</span>
                <Sparkles className="text-gold" size={18} />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {active && (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-night/90 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <button className="dynamic-button absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-cream/20 bg-night" aria-label="Close lightbox">
              <X />
            </button>
            <motion.img layoutId={`image-${active.id}`} src={active.src} alt={active.title} className="max-h-[86vh] max-w-full rounded-lg border border-gold/25 object-contain shadow-glow" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function localizePricing(adminPricing, translatedPricing, lang) {
  const isArabic = lang === "ar";
  return translatedPricing.map((translatedPlan, index) => {
    const adminPlan = adminPricing[index] || {};
    const rawPrice = adminPlan.price || translatedPlan.price;
    const price = isArabic
      ? rawPrice.replace(/\bDHS\b/gi, "درهم").replace(/^درهم\s*([0-9-]+)/, "$1 درهم")
      : rawPrice;

    return {
      ...translatedPlan,
      price
    };
  });
}

function Pricing({ t, settings, lang }) {
  const pricing = localizePricing(settings.pricing, t.pricing, lang);
  return (
    <section id="pricing" className="relative overflow-hidden bg-luxury px-4 py-24 md:px-8 text-night">
      <div className="absolute inset-0 moroccan-mask opacity-15" />
      <SectionHeading eyebrow={t.sections.pricingEyebrow} title={t.sections.pricingTitle} />
      <div className="relative mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {pricing.map((plan, index) => (
          <motion.article
            key={plan.name}
            initial={{ opacity: 0, y: 46, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{ duration: 0.85, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="luxury-cream-card rounded-lg border border-night/10 p-7 backdrop-blur-xl transition hover:border-gold/60 hover:shadow-glow"
          >
            <div className="mb-7 grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
              <Sparkles />
            </div>
            <h3 className="font-display text-3xl font-bold text-night">{plan.name}</h3>
            <p className="mt-4 text-4xl font-black text-gold">{plan.price}</p>
            <p className="mt-5 leading-7 text-night/70">{plan.desc}</p>
            <motion.a
              href={whatsappUrl(t, settings)}
              target="_blank"
              rel="noreferrer"
              className="luxury-action-button mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-gold/45 bg-night px-5 py-3 font-bold text-cream shadow-soft"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check size={18} className="luxury-action-icon" />
              <span>{t.social.whatsapp}</span>
            </motion.a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ t }) {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState({ name: "", comment: "", rating: 5, image: "", company: "" });
  const [ownedReviews, setOwnedReviews] = useState(readOwnedReviews);

  useEffect(() => {
    let active = true;
    fetch(apiEndpoint("/api/reviews"))
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (active) setReviews(data.reviews || []);
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const submitReview = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setStatusMessage("");
    try {
      const response = await fetch(apiEndpoint("/api/reviews"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.errors?.join(" ") || data.message || t.reviewForm.error);
      }
      if (data.review?.id && data.review?.deleteKey) {
        const nextOwnedReviews = { ...ownedReviews, [data.review.id]: data.review.deleteKey };
        localStorage.setItem("henna-owned-reviews", JSON.stringify(nextOwnedReviews));
        setOwnedReviews(nextOwnedReviews);
      }
      setReviews((items) => [data.review, ...items]);
      setForm({ name: "", comment: "", rating: 5, image: "", company: "" });
      setStatus("success");
    } catch (error) {
      setStatusMessage(error.message || t.reviewForm.error);
      setStatus("error");
    }
  };

  const chooseImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("idle");
    try {
      const image = await resizeReviewImage(file);
      setForm((current) => ({ ...current, image }));
    } catch {
      setStatus("imageError");
    }
  };

  const deleteExistingReview = async (reviewId) => {
    const deleteKey = ownedReviews[reviewId];
    const adminCode = deleteKey ? "" : window.prompt(t.reviewForm.adminPrompt);
    if (!deleteKey && !adminCode) return;

    setStatus("idle");
    try {
      const response = await fetch(apiEndpoint(`/api/reviews/${reviewId}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(deleteKey ? { "x-delete-key": deleteKey } : { "x-admin-code": adminCode })
        },
        body: JSON.stringify(deleteKey ? { deleteKey } : { adminCode })
      });
      if (!response.ok) throw new Error("Delete failed");
      setReviews((items) => items.filter((item) => item.id !== reviewId));
      if (deleteKey) {
        const nextOwnedReviews = { ...ownedReviews };
        delete nextOwnedReviews[reviewId];
        localStorage.setItem("henna-owned-reviews", JSON.stringify(nextOwnedReviews));
        setOwnedReviews(nextOwnedReviews);
      }
      setStatus("deleted");
    } catch {
      setStatus("deleteError");
    }
  };

  return (
    <section id="testimonials" className="soft-luxury-section px-4 py-24 md:px-8">
      <SectionHeading eyebrow={t.sections.testimonialsEyebrow} title={t.sections.testimonialsTitle} />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.form onSubmit={submitReview} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="luxury-cream-card rounded-lg border border-night/10 p-6 backdrop-blur-xl">
          <label className="sr-only" htmlFor="review-company">{t.reviewForm.trap}</label>
          <input id="review-company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="hidden" tabIndex="-1" autoComplete="off" />
          <Field label={t.reviewForm.name} value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-night/75">{t.reviewForm.rating}</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setForm({ ...form, rating })}
                  className={`dynamic-button grid h-11 w-11 place-items-center rounded-full border transition ${rating <= form.rating ? "border-gold bg-gold text-cream shadow-glow" : "border-night/10 bg-white/70 text-night/35 hover:border-gold hover:text-gold"}`}
                  aria-label={`${rating} ${t.reviewForm.stars}`}
                >
                  <Star size={18} fill="currentColor" />
                </button>
              ))}
            </div>
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-night/75">{t.reviewForm.comment}</span>
            <textarea required value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} rows="5" placeholder={t.reviewForm.placeholder} className="w-full rounded-lg border border-night/10 bg-white/75 px-4 py-3 text-night outline-none transition focus:border-gold" />
          </label>
          <label className="dynamic-button mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-night/10 bg-white/70 px-4 py-3 text-night/75 transition hover:border-gold hover:text-gold">
            <span className="inline-flex items-center gap-2 font-bold"><ImagePlus size={18} /> {t.reviewForm.image}</span>
            <span className="text-xs">{form.image ? t.reviewForm.imageReady : t.reviewForm.imageHint}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage} className="sr-only" />
          </label>
          {form.image && <img src={form.image} alt="" className="mt-4 h-24 w-24 rounded-full border border-gold/30 object-cover shadow-soft" />}
          <button disabled={status === "loading"} className="dynamic-button mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 font-bold text-cream shadow-glow disabled:opacity-60">
            <Send size={18} />
            {status === "loading" ? t.reviewForm.sending : t.reviewForm.submit}
          </button>
          <AnimatePresence>
            {status === "success" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-emerald-500/15 p-3 text-emerald-700">{t.reviewForm.success}</motion.p>}
            {status === "deleted" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-emerald-500/15 p-3 text-emerald-700">{t.reviewForm.deleted}</motion.p>}
            {status === "error" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-red-500/15 p-3 text-red-700">{statusMessage || t.reviewForm.error}</motion.p>}
            {status === "deleteError" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-red-500/15 p-3 text-red-700">{t.reviewForm.deleteError}</motion.p>}
            {status === "imageError" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-red-500/15 p-3 text-red-700">{t.reviewForm.imageError}</motion.p>}
          </AnimatePresence>
        </motion.form>
        <div className="grid content-start gap-5 md:grid-cols-2">
          {reviews.length === 0 && (
            <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="luxury-cream-card rounded-lg border border-night/10 p-6 text-night/70 backdrop-blur-xl md:col-span-2">
              {t.reviewForm.empty}
            </motion.div>
          )}
          {reviews.map((item, index) => (
            <motion.article key={item.id} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="luxury-cream-card relative rounded-lg border border-night/10 p-6 backdrop-blur-xl">
              <button type="button" onClick={() => deleteExistingReview(item.id)} className="dynamic-button absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-night/10 bg-white/70 text-night/45 transition hover:border-gold hover:text-gold" aria-label={t.reviewForm.delete}>
                <Trash2 size={16} />
              </button>
              <div className="mb-5 flex items-center gap-4">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-full border border-gold/30 object-cover shadow-soft" loading="lazy" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold to-henna font-display text-xl font-bold text-cream">
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-night">{item.name}</h3>
                  <div className="mt-1 flex text-gold">
                    {[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={14} fill="currentColor" className={rating <= item.rating ? "" : "opacity-25"} />)}
                  </div>
                </div>
              </div>
              <p className="leading-7 text-night/70">"{item.comment}"</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialSection({ t, settings }) {
  return (
    <section className="bg-silk px-4 py-20 text-night md:px-8">
      <SectionHeading eyebrow={t.sections.socialEyebrow} title={t.sections.socialTitle} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={luxeStagger} className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
        <SocialCard href={settings.socials.instagramUrl} icon={<Instagram />} title="Instagram" label={t.social.instagram} />
        <SocialCard href={settings.socials.tiktokUrl} icon={<Music2 />} title="TikTok" label={t.social.tiktok} />
        <SocialCard href={whatsappUrl(t, settings)} icon={<MessageCircle />} title="WhatsApp" label={t.social.whatsapp} />
      </motion.div>
    </section>
  );
}

function LocalSeoSection({ t }) {
  return (
    <section className="relative overflow-hidden px-5 py-20">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[1.75rem] border border-gold/20 bg-night/70 p-8 shadow-glow backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-12">
        <Reveal>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-gold">{t.seoLocal.eyebrow}</p>
          <h2 className="font-display text-4xl font-bold leading-tight text-cream md:text-5xl">{t.seoLocal.title}</h2>
          <p className="mt-6 max-w-3xl text-lg font-medium leading-8 text-cream/78">{t.seoLocal.copy}</p>
        </Reveal>
        <motion.div
          variants={luxeStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid content-center gap-4"
        >
          {t.seoLocal.points.map((point) => (
            <motion.div
              key={point}
              variants={luxeReveal}
              className="luxury-cream-card flex items-center gap-4 rounded-2xl px-5 py-4 text-night"
            >
              <Sparkles className="shrink-0 text-gold" size={20} />
              <span className="font-bold">{point}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SocialCard({ href, icon, title, label }) {
  return (
    <motion.a href={href} target="_blank" rel="noreferrer" variants={luxeReveal} whileHover={{ y: -8 }} className="luxury-cream-card rounded-lg border border-night/10 p-6 backdrop-blur-xl transition hover:bg-white/70">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-night text-gold">{icon}</div>
      <h3 className="font-display text-3xl font-bold">{title}</h3>
      <p className="mt-3 inline-flex items-center gap-2 font-bold text-henna">
        {label} <ArrowUpRight size={18} />
      </p>
    </motion.a>
  );
}

function Contact({ t, settings }) {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", company: "" });

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    try {
      const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const endpoint = apiBase.includes(".netlify/functions") ? `${apiBase}/contact` : `${apiBase}/api/contact`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (response.status === 503) {
        setStatus("setup");
        return;
      }
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "", company: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-luxury px-4 py-24 md:px-8 text-night">
      <div className="absolute inset-0 moroccan-mask opacity-20" />
      <SectionHeading eyebrow={t.sections.contactEyebrow} title={t.sections.contactTitle} copy={t.sections.contactCopy} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} variants={luxeStagger} className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr]">
        <motion.div variants={luxeReveal} className="luxury-cream-card rounded-lg border border-night/10 p-6 backdrop-blur-xl">
          <div className="grid gap-4 text-night/80">
            <ContactLine icon={<MessageCircle />} label="WhatsApp" value={settings.socials.displayPhone} href={whatsappUrl(t, settings)} />
            <ContactLine icon={<Instagram />} label="Instagram" value={settings.socials.instagramHandle} href={settings.socials.instagramUrl} />
            <ContactLine icon={<Music2 />} label="TikTok" value={settings.socials.tiktokHandle} href={settings.socials.tiktokUrl} />
            <ContactLine icon={<Mail />} label="Email" value={settings.socials.email} href={`mailto:${settings.socials.email}`} />
            <ContactLine icon={<MapPin />} label="Location" value={settings.location.label} />
          </div>
          <div className="map-frame mt-6 overflow-hidden rounded-lg border border-night/10">
            <iframe
              title="Riad Laârous Marrakech map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(settings.location.mapQuery)}&output=embed`}
              width="100%"
              height="290"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </motion.div>
        <motion.form variants={luxeReveal} onSubmit={submit} className="luxury-cream-card rounded-lg border border-night/10 p-6 backdrop-blur-xl">
          <label className="sr-only" htmlFor="company">{t.contact.trap}</label>
          <input id="company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="hidden" tabIndex="-1" autoComplete="off" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.contact.name} value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Field type="email" label={t.contact.email} value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
            <Field label={t.contact.phone} value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-bold text-night/75">{t.contact.message}</span>
              <textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows="6" className="w-full rounded-lg border border-night/10 bg-white/75 px-4 py-3 text-night outline-none transition focus:border-gold" />
            </label>
          </div>
          <button disabled={status === "loading"} className="dynamic-button mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 font-bold text-cream shadow-glow disabled:opacity-60">
            <Send size={18} />
            {t.contact.send}
          </button>
          <AnimatePresence>
            {status === "success" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-emerald-500/15 p-3 text-emerald-100">{t.contact.success}</motion.p>}
            {status === "setup" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-gold/10 p-3 text-henna">{t.contact.setup}</motion.p>}
            {status === "error" && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-lg bg-red-500/15 p-3 text-red-100">{t.contact.error}</motion.p>}
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-night/75">{label}</span>
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-night/10 bg-white/75 px-4 py-3 text-night outline-none transition focus:border-gold" />
    </label>
  );
}

function ContactLine({ icon, label, value, href }) {
  const content = (
    <motion.div variants={luxeReveal} className="flex items-center gap-4 luxury-cream-card rounded-lg border border-night/10 p-4 transition hover:border-gold/50">
      <span className="text-gold">{icon}</span>
      <span>
        <span className="block text-sm text-night/55">{label}</span>
        <span className="font-semibold text-night">{value}</span>
      </span>
    </motion.div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a> : content;
}

function AdminPanel({ settings, setSettings }) {
  const [adminCode, setAdminCode] = useState(() => localStorage.getItem("henna-admin-code") || "");
  const [draft, setDraft] = useState(settings);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("");
  const categories = ["bridal", "hands", "feet", "modern", "moroccan", "luxury"];

  useEffect(() => setDraft(settings), [settings]);

  const loadReviews = () => {
    fetch(apiEndpoint("/api/reviews"))
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]));
  };

  useEffect(loadReviews, []);

  const updateSocial = (key, value) => setDraft((current) => ({ ...current, socials: { ...current.socials, [key]: value } }));
  const updateLocation = (key, value) => setDraft((current) => ({ ...current, location: { ...current.location, [key]: value } }));
  const updatePricing = (index, key, value) => setDraft((current) => ({
    ...current,
    pricing: current.pricing.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
  }));
  const updateGallery = (index, key, value) => setDraft((current) => ({
    ...current,
    gallery: current.gallery.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
  }));
  const removeGallery = (index) => setDraft((current) => ({ ...current, gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index) }));

  const addGalleryImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const src = await resizeAdminImage(file);
      setDraft((current) => ({
        ...current,
        gallery: [{ id: `admin-${Date.now()}`, title: "New henna design", category: "hands", src }, ...current.gallery]
      }));
      event.target.value = "";
    } catch {
      setStatus("Image makhdamach, jarrbi image okhra.");
    }
  };

  const saveSettings = async () => {
    setStatus("Saving...");
    try {
      const response = await fetch(apiEndpoint("/api/admin/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminCode, settings: draft })
      });
      if (!response.ok) throw new Error("save failed");
      const data = await response.json();
      localStorage.setItem("henna-admin-code", adminCode);
      setSettings(mergeSiteSettings(data.settings));
      setStatus("Tsavew les changements.");
    } catch {
      setStatus("Code ghalat ola server makhdamch.");
    }
  };

  const deleteReviewAsAdmin = async (id) => {
    setStatus("Deleting...");
    try {
      const response = await fetch(apiEndpoint(`/api/reviews/${id}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-code": adminCode },
        body: JSON.stringify({ adminCode })
      });
      if (!response.ok) throw new Error("delete failed");
      loadReviews();
      setStatus("Commentaire tmseh.");
    } catch {
      setStatus("Ma tmsahch. T2ekdi mn code.");
    }
  };

  return (
    <main className="min-h-screen bg-night px-4 py-8 text-cream md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <a href="/" className="text-sm font-bold text-gold">Retour site</a>
            <h1 className="mt-3 font-display text-4xl font-bold">Admin henna_marrakech</h1>
            <p className="mt-2 text-cream/70">T7ekmi f prix, photos, localisation, réseaux sociaux, WhatsApp et commentaires.</p>
          </div>
          <div className="luxury-cream-card flex flex-col gap-3 rounded-2xl p-4 text-night md:min-w-[320px]">
            <label className="text-sm font-bold">Code propriétaire</label>
            <input value={adminCode} onChange={(event) => setAdminCode(event.target.value)} className="admin-input" type="password" placeholder="Code admin" />
            <button type="button" onClick={saveSettings} className="dynamic-button rounded-full bg-gold px-5 py-3 font-bold text-cream">Sauvegarder tout</button>
            {status && <p className="text-sm font-bold text-henna">{status}</p>}
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <AdminCard title="Prix">
            {draft.pricing.map((plan, index) => (
              <div key={index} className="mb-4 grid gap-3 rounded-2xl border border-night/10 bg-white/60 p-4">
                <input value={plan.name} onChange={(event) => updatePricing(index, "name", event.target.value)} className="admin-input" placeholder="Nom" />
                <input value={plan.price} onChange={(event) => updatePricing(index, "price", event.target.value)} className="admin-input" placeholder="Prix" />
                <textarea value={plan.desc} onChange={(event) => updatePricing(index, "desc", event.target.value)} className="admin-input min-h-20" placeholder="Description" />
              </div>
            ))}
          </AdminCard>

          <AdminCard title="Réseaux + Contact">
            <AdminField label="WhatsApp number" value={draft.socials.whatsappNumber} onChange={(value) => updateSocial("whatsappNumber", value)} />
            <AdminField label="Phone visible" value={draft.socials.displayPhone} onChange={(value) => updateSocial("displayPhone", value)} />
            <AdminField label="Instagram handle" value={draft.socials.instagramHandle} onChange={(value) => updateSocial("instagramHandle", value)} />
            <AdminField label="Instagram link" value={draft.socials.instagramUrl} onChange={(value) => updateSocial("instagramUrl", value)} />
            <AdminField label="TikTok handle" value={draft.socials.tiktokHandle} onChange={(value) => updateSocial("tiktokHandle", value)} />
            <AdminField label="TikTok link" value={draft.socials.tiktokUrl} onChange={(value) => updateSocial("tiktokUrl", value)} />
            <AdminField label="Email" value={draft.socials.email} onChange={(value) => updateSocial("email", value)} />
          </AdminCard>

          <AdminCard title="Localisation">
            <AdminField label="Adresse visible" value={draft.location.label} onChange={(value) => updateLocation("label", value)} />
            <AdminField label="Google Maps search" value={draft.location.mapQuery} onChange={(value) => updateLocation("mapQuery", value)} />
          </AdminCard>

          <AdminCard title="Commentaires">
            <button type="button" onClick={loadReviews} className="dynamic-button mb-4 rounded-full bg-night px-5 py-3 font-bold text-cream">Actualiser</button>
            <div className="grid max-h-[460px] gap-3 overflow-auto pr-1">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-night/10 bg-white/65 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{review.name}</strong>
                    <button type="button" onClick={() => deleteReviewAsAdmin(review.id)} className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">Supprimer</button>
                  </div>
                  <p className="mt-2 text-sm text-night/70">{review.comment}</p>
                </div>
              ))}
              {!reviews.length && <p className="text-night/60">Aucun commentaire pour le moment.</p>}
            </div>
          </AdminCard>
        </section>

        <AdminCard title="Photos / Gallery" className="mt-6">
          <label className="dynamic-button mb-5 inline-flex cursor-pointer rounded-full bg-gold px-5 py-3 font-bold text-cream">
            Ajouter une photo
            <input type="file" accept="image/*" onChange={addGalleryImage} className="hidden" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {draft.gallery.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-night/10 bg-white/65 p-4">
                <img src={item.src} alt={item.title} className="mb-3 h-44 w-full rounded-xl object-cover" />
                <input value={item.title} onChange={(event) => updateGallery(index, "title", event.target.value)} className="admin-input mb-2" placeholder="Titre" />
                <select value={item.category} onChange={(event) => updateGallery(index, "category", event.target.value)} className="admin-input mb-3">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <button type="button" onClick={() => removeGallery(index)} className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">Supprimer photo</button>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </main>
  );
}

function AdminCard({ title, children, className = "" }) {
  return (
    <section className={`luxury-cream-card rounded-[1.5rem] p-5 text-night shadow-soft ${className}`}>
      <h2 className="mb-5 font-display text-3xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function AdminField({ label, value, onChange }) {
  return (
    <label className="mb-3 grid gap-2 text-sm font-bold">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="admin-input" />
    </label>
  );
}

function FloatingActions({ t, settings }) {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer) return undefined;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {!footerVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
          <motion.a href={settings.socials.instagramUrl} target="_blank" rel="noreferrer" whileHover={{ scale: 1.08 }} className="dynamic-button grid h-12 w-12 place-items-center rounded-full border border-cream/20 bg-night/80 text-gold shadow-glow backdrop-blur-xl" aria-label="Open Instagram">
            <Instagram size={20} />
          </motion.a>
          <motion.a href={settings.socials.tiktokUrl} target="_blank" rel="noreferrer" whileHover={{ scale: 1.08 }} className="dynamic-button grid h-12 w-12 place-items-center rounded-full border border-cream/20 bg-night/80 text-gold shadow-glow backdrop-blur-xl" aria-label="Open TikTok">
            <Music2 size={20} />
          </motion.a>
          <motion.a href={whatsappUrl(t, settings)} target="_blank" rel="noreferrer" whileHover={{ scale: 1.08 }} className="dynamic-button grid h-14 w-14 place-items-center rounded-full bg-gold text-cream shadow-glow" aria-label="Book on WhatsApp">
            <MessageCircle size={24} />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Footer({ t, settings }) {
  return (
    <footer className="site-footer border-t border-cream/10 px-4 py-12 md:px-8">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={luxeStagger} className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_.8fr_.8fr]">
        <motion.div variants={luxeReveal}>
          <h2 className="font-display text-3xl font-bold gold-text">henna_marrakech</h2>
          <p className="mt-4 max-w-md text-base font-medium leading-7 text-cream">{settings.location.label}</p>
        </motion.div>
        <motion.div variants={luxeReveal}>
          <h3 className="mb-4 font-bold text-gold">{t.footer.quick}</h3>
          <div className="grid gap-3 text-base font-medium text-cream">
            <a href="#gallery" className="footer-nav-link">{t.nav.gallery}</a>
            <a href="#pricing" className="footer-nav-link">{t.nav.pricing}</a>
            <a href="#contact" className="footer-nav-link">{t.nav.contact}</a>
          </div>
        </motion.div>
        <motion.div variants={luxeReveal}>
          <h3 className="mb-4 font-bold text-gold">Social</h3>
          <div className="flex gap-3">
            <a href={whatsappUrl(t, settings)} target="_blank" rel="noreferrer" className="dynamic-button footer-social-button grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-gold"><MessageCircle size={18} /></a>
            <a href={settings.socials.instagramUrl} target="_blank" rel="noreferrer" className="dynamic-button footer-social-button grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-gold"><Instagram size={18} /></a>
            <a href={settings.socials.tiktokUrl} target="_blank" rel="noreferrer" className="dynamic-button footer-social-button grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-gold"><Music2 size={18} /></a>
          </div>
        </motion.div>
      </motion.div>
      <Reveal as="p" delay={0.15} className="mx-auto mt-10 max-w-7xl text-sm text-cream/80">© 2026 henna_marrakech. {t.footer.rights}</Reveal>
    </footer>
  );
}

export default function App() {
  const { lang, setLang, t } = useLanguage();
  const { settings, setSettings } = useSiteSettings();
  const isAdminPage = window.location.pathname === "/admin" || window.location.hash === "#admin";

  if (isAdminPage) {
    return (
      <>
        <CursorGlow />
        <AdminPanel settings={settings} setSettings={setSettings} />
      </>
    );
  }

  return (
    <>
      <LoadingScreen />
      <CursorGlow />
      <GlobalStarField />
      <Navbar t={t} lang={lang} setLang={setLang} />
      <main className="relative z-10">
        <Hero t={t} settings={settings} />
        <DesignChoice t={t} settings={settings} />
        <Gallery t={t} settings={settings} />
        <Pricing t={t} settings={settings} lang={lang} />
        <Testimonials t={t} />
        <LocalSeoSection t={t} />
        <SocialSection t={t} settings={settings} />
        <Contact t={t} settings={settings} />
      </main>
      <Footer t={t} settings={settings} />
      <FloatingActions t={t} settings={settings} />
    </>
  );
}


