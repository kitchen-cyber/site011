# raqt fuel — London Catering

Website + admin panel with full content control (all texts and photos) and Google authentication.

## Quick Start

```bash
npm install
npm start          # http://localhost:3000
```

- **Website:** http://localhost:3000
- **Team:** http://localhost:3000/team
- **Admin Panel:** http://localhost:3000/admin

> Until Google OAuth is configured, you can access the admin panel using the **"Dev Login"** button
> (works locally only, disabled in production).

## Structure

```
server.js            — Express server: rendering, API, auth, upload
data/content.json    — ALL site content (texts + photo paths)
data/enquiries.json  — contact form submissions
data/backups/        — auto-backups of content (last 20 saves)
views/               — page templates (index.ejs, team.ejs)
admin/index.html     — admin panel (SPA)
public/img/          — site images
public/uploads/      — photos uploaded via admin
.env                 — keys and settings (DO NOT commit!)
```

## Google OAuth Setup (required for production)

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create a project (e.g., `raqt-fuel`).
2. **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create
   - Fill in application name (`raqt fuel admin`), support email → Save
   - Scopes: add `email`, `profile`, `openid`
   - Test users: add your Gmail (while app is in Testing mode)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (for development)
     - `https://YOUR-DOMAIN/auth/google/callback` (for production)
4. Copy **Client ID** and **Client Secret** to `.env` file:

```env
GOOGLE_CLIENT_ID=1234567890-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
ADMIN_EMAILS=your.email@gmail.com,partner@gmail.com
SESSION_SECRET=long-random-string
BASE_URL=http://localhost:3000
NODE_ENV=development
```

5. Restart the server. The "Sign in with Google" button will work.

> **Only email addresses listed in `ADMIN_EMAILS` have access.**
> Any other Google account will receive "not allowed" error.

For production: `NODE_ENV=production`, `BASE_URL=https://your-domain`,
generate `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Admin Panel Features

- **Content** — edit any text on the site (headings, descriptions, service
  cards, menu, statistics, testimonials, team, contacts, footer, cookie banner).
- **Photos** — replace any image: paste URL or upload file
  (JPG/PNG/WebP up to 10 MB). Thumbnail preview directly in the panel.
- **Lists** — add/delete/reorder (↑↓) cards, testimonials,
  team members, gallery photos.
- **Enquiries** — all contact form submissions with statuses
  (New → Contacted → Quoted → Confirmed → Archived), badge for new entries.
- **Auto-backups** — each content save creates a backup of the previous version
  in `data/backups/` (last 20 kept).

## Fixed Bugs (compared to old static version)

- Broken preloader logo (file was missing in root)
- Cyrillic image filenames → Latin (`/public/img/`)
- Invisible hamburger menu on mobile (was white on cream)
- Undefined CSS variable `--container` in footer
- Contact form now actually works — enquiries are saved and visible in admin (+ honeypot anti-spam)
- Clickable phone (`tel:`) and email (`mailto:`)
- SEO: meta description, Open Graph, favicon, schema.org (FoodEstablishment)
- Dead `#` links in footer → real anchors
- Gallery counter no longer hardcoded (counts photos dynamically)
- Preloader shown only on first visit per session
- Support for `prefers-reduced-motion` (accessibility)
- `100svh` for hero on mobile Safari
- Image weight: 7+ MB → ~0.6 MB (JPEG compression, logo resize)
- `aria-expanded`, `aria-label`, `autocomplete` for form and menu

## Smoke Test

```bash
node test-check.js   # 24 rendering and API checks (server must be running)
```

## Deployment

The app runs on any Node.js host. Examples:

**Vercel / Netlify / Render:**
- Set environment variables in the dashboard
- Deploy from this repository
- Domain-based `BASE_URL` will be auto-detected

**VPS / Ubuntu:**
```bash
npm install --production
pm2 start server.js --name raqt-fuel
pm2 save
```

**Docker:**
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## Tech Stack

- **Backend:** Node.js 24+, Express 5
- **Templates:** EJS
- **Auth:** Google OAuth 2.0 (manual implementation, no Passport)
- **Storage:** JSON files (content + enquiries)
- **Upload:** Multer (images up to 10MB)
- **Sessions:** express-session with httpOnly cookies

## License

Private project. All rights reserved.
