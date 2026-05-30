# henna_marrakech

Premium multilingual website for a Moroccan henna artist in Marrakech.

## Local Setup

```bash
npm install
npm run dev
```

For the contact form backend:

```bash
cp .env.example .env
npm run server
```

Set `VITE_API_URL=http://localhost:5000` for local frontend-to-backend requests if you run the backend separately.

## Email Setup

The Express backend uses Nodemailer. Configure:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_TO=ndounya8@gmail.com`

For Gmail, use an app password, not the normal mailbox password.

## Deploy

### Vercel

Deploy the Vite frontend normally. Add environment variables in Vercel. For a separate backend, deploy `server/index.js` on Render, Railway, Fly.io, or a Vercel serverless function and set `VITE_API_URL`.

### Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

Set `VITE_API_URL` to the deployed backend URL.

Netlify can also use the included function at `/.netlify/functions/contact`; set `VITE_API_URL=/.netlify/functions` before building.

### GitHub Pages

GitHub Pages can host the static frontend only. Use EmailJS or connect the form to an external backend URL through `VITE_API_URL`.

## SEO

Includes semantic sections, localized runtime meta tags, JSON-LD structured data, `robots.txt`, `sitemap.xml`, OpenGraph tags, and mobile-first responsive markup.
