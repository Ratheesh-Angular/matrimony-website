# Business Site Starter

Clone-per-client Next.js starter for local business websites. Same MongoDB Atlas URI, different database name per client. Deploy each clone as its own Vercel project.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- MongoDB Atlas + Mongoose
- Vercel-ready

## Quick start

1. Copy `.env.example` to `.env.local` and fill in values.
2. Install and run:

```bash
npm install
npm run seed
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)  
4. Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (password from `ADMIN_PASSWORD`)

Without MongoDB configured, public pages still render using `site.config.ts` + seed fallbacks. Forms and admin need a working `MONGODB_URI`.

## Clone checklist (new client)

1. **Copy this repo** into a new folder / GitHub repo.
2. **Env / Vercel**
   - `MONGODB_URI` — same Atlas connection string
   - `MONGODB_DB_NAME` — unique per client (e.g. `acme_business`)
   - `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_SITE_URL` — production domain
3. **Edit [`src/site.config.ts`](src/site.config.ts)**
   - Business name, tagline, colors, nav, WhatsApp number, map defaults, feature flags
4. **Replace branding**
   - Drop logo into `public/brand/logo.svg` (or png and update `logoPath`)
   - Update banner images under `public/brand/` or point banners to URLs in admin
5. **Seed the database**

```bash
npm run seed
```

   The database is created automatically on first write. Seed creates settings, banners, and about/contact/location pages.
6. **Deploy to Vercel**
   - Import the client repo
   - Add the same env vars in the Vercel project
   - Attach the client domain
7. **Customize content** in `/admin` (settings, banners, pages, enquiries)

## What is shared vs per-client

| Shared (in starter) | Per client |
| --- | --- |
| Page structure & components | `src/site.config.ts` branding |
| Models & APIs | `MONGODB_DB_NAME` |
| WhatsApp / Maps / forms | Logo, copy, banners |
| Admin CMS | Domain + Vercel project |

## Project structure

```
src/site.config.ts      # branding & feature flags
src/app/(site)/         # public site
src/app/admin/          # lightweight CMS
src/app/api/            # forms + admin APIs
src/components/         # Header, banners, forms, map, WhatsApp
src/models/             # Mongoose models
src/content/seed.ts     # default content
scripts/seed.ts         # npm run seed
```

## Features included

- Landing page with banner slider
- About, Contact, Location (+ dynamic `/[slug]` pages)
- Contact & enquiry forms → MongoDB
- WhatsApp floating button
- Google Maps embed (lat/lng or custom embed URL)
- SEO basics: metadata, sitemap, robots
- Admin: settings, banners, pages, enquiries

## Vercel notes

- One Vercel project per client clone
- Set env vars in Project Settings → Environment Variables
- No special build command needed (`next build`)
- After first deploy, run seed once locally against the same URI/DB, or open the site so `ensureSeeded()` creates defaults on first request

## Optional email notify

`src/lib/mail.ts` logs enquiries when `NOTIFY_EMAIL_TO` is set. Replace the placeholder with Resend, Nodemailer, or another provider.
