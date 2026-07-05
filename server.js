require('dotenv').config();
const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;
const IS_PROD = process.env.NODE_ENV === 'production' || IS_VERCEL;

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (IS_VERCEL && req) return `https://${req.hostname}`;
  return `http://localhost:${PORT}`;
}

const DATA_DIR = IS_VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const UPLOADS_DIR = IS_VERCEL ? '/tmp/uploads' : path.join(__dirname, 'public', 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Seed content.json on Vercel (read-only filesystem, copy from repo to /tmp)
if (IS_VERCEL) {
  try {
    if (!fs.existsSync(CONTENT_FILE)) {
      const src = path.join(__dirname, 'data', 'content.json');
      if (fs.existsSync(src)) fs.copyFileSync(src, CONTENT_FILE);
      else fs.writeFileSync(CONTENT_FILE, '{}');
    }
    if (!fs.existsSync(ENQUIRIES_FILE)) {
      fs.writeFileSync(ENQUIRIES_FILE, '[]');
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  }
}

// ── Google OAuth config ──
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);
const OAUTH_CONFIGURED = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

if (!OAUTH_CONFIGURED) {
  console.warn('[WARN] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google login disabled.');
  if (!IS_PROD) console.warn('[WARN] Dev mode: local admin login is available at /admin (no Google needed).');
}
if (ADMIN_EMAILS.length === 0) {
  console.warn('[WARN] ADMIN_EMAILS is empty — nobody can log in via Google until you add emails to .env');
}

// ── Helpers ──
function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
function writeJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function nl2br(s) {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}
function getContent() {
  return readJson(CONTENT_FILE, {});
}

// ── Consistent secret for sessions & signed cookies ──
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET && IS_PROD) {
  console.warn('[CRITICAL] SESSION_SECRET not set in environment! Set it to fix login on Vercel.');
  console.warn('[CRITICAL] Run: node -e "console.log(require(\\'crypto\\').randomBytes(32).toString(\\'hex\\'))"');
}

// ── App setup ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));
app.use(cookieParser(SESSION_SECRET));
app.use(cookieSession({
  name: 'raqt.sid',
  secret: SESSION_SECRET,
  httpOnly: true,
  sameSite: 'lax',
  secure: IS_PROD,
  maxAge: 1000 * 60 * 60 * 24 * 7
}));

function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// ── Public pages ──
app.get('/', (req, res) => {
  res.render('index', { c: getContent(), nl2br });
});
app.get('/team', (req, res) => {
  res.render('team', { c: getContent(), nl2br });
});
app.get('/index.html', (req, res) => res.redirect(301, '/'));
app.get('/team.html', (req, res) => res.redirect(301, '/team'));

// ── Public API: enquiry form ──
app.post('/api/enquiry', (req, res) => {
  const { firstName, lastName, email, phone, eventType, guestCount, message, website } = req.body || {};
  if (website) return res.json({ ok: true });
  if (!firstName || !lastName || !email || !eventType || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const enquiries = readJson(ENQUIRIES_FILE, []);
  enquiries.unshift({
    id: crypto.randomUUID(),
    firstName: String(firstName).slice(0, 100),
    lastName: String(lastName).slice(0, 100),
    email: String(email).slice(0, 200),
    phone: String(phone || '').slice(0, 50),
    eventType: String(eventType).slice(0, 100),
    guestCount: String(guestCount || '').slice(0, 50),
    message: String(message).slice(0, 5000),
    status: 'new',
    createdAt: new Date().toISOString()
  });
  writeJson(ENQUIRIES_FILE, enquiries);
  res.json({ ok: true });
});

// ── Google OAuth ──
app.get('/auth/google', (req, res) => {
  if (!OAUTH_CONFIGURED) {
    if (!IS_PROD) {
      req.session.user = { email: 'dev@localhost', name: 'Dev Admin', picture: '', isAdmin: true };
      return res.redirect('/');
    }
    const baseUrl = getBaseUrl(req);
    return res.redirect(`/admin?setup=1&uri=${encodeURIComponent(baseUrl + '/auth/google/callback')}`);
  }
  const state = crypto.randomBytes(16).toString('hex');
  // Store state in signed cookie (works on serverless Vercel)
  res.cookie('oauth_state', state, { signed: true, httpOnly: true, sameSite: 'lax', secure: IS_PROD, maxAge: 5 * 60 * 1000 });
  const baseUrl = getBaseUrl(req);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${baseUrl}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account'
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (req.query.error) {
      return res.redirect(`/admin?setup=1&uri=${encodeURIComponent(getBaseUrl(req) + '/auth/google/callback')}&error=${req.query.error}`);
    }
    // Verify state from signed cookie (not session - works on serverless)
    if (!code || !state || state !== req.signedCookies.oauth_state) {
      return res.redirect('/?error=auth_failed');
    }
    res.clearCookie('oauth_state');
    const baseUrl = getBaseUrl(req);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    });
    if (!tokenRes.ok) throw new Error('Token exchange failed');
    const tokens = await tokenRes.json();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    if (!userRes.ok) throw new Error('Userinfo failed');
    const profile = await userRes.json();

    const email = String(profile.email || '').toLowerCase();
    if (!profile.email_verified) {
      return res.redirect('/?error=email_not_verified');
    }

    req.session.user = {
      email,
      name: profile.name || email,
      picture: profile.picture || '',
      isAdmin: ADMIN_EMAILS.includes(email)
    };
    res.redirect('/');
  } catch (err) {
    console.error('OAuth error:', err.message);
    res.redirect('/?error=oauth_failed');
  }
});

// Dev login
app.post('/auth/dev-login', (req, res) => {
  if (OAUTH_CONFIGURED || IS_PROD) return res.status(403).json({ error: 'Disabled' });
  req.session.user = { email: 'dev@localhost', name: 'Dev Admin', picture: '', isAdmin: true };
  res.json({ ok: true });
});

app.post('/auth/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

// ── Public auth status ──
app.get('/api/auth/status', (req, res) => {
  res.json({
    user: req.session.user || null,
    oauthConfigured: OAUTH_CONFIGURED,
    devMode: !OAUTH_CONFIGURED && !IS_PROD
  });
});

// ── Admin panel ──
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/api/admin/me', (req, res) => {
  if (req.session.user && req.session.user.isAdmin) {
    return res.json({ user: req.session.user, oauthConfigured: OAUTH_CONFIGURED, devMode: !OAUTH_CONFIGURED && !IS_PROD });
  }
  res.json({ user: req.session.user || null, oauthConfigured: OAUTH_CONFIGURED, devMode: !OAUTH_CONFIGURED && !IS_PROD });
});

// Content
app.get('/api/admin/content', requireAdmin, (req, res) => {
  res.json(getContent());
});
app.put('/api/admin/content', requireAdmin, (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Invalid content' });
  }
  const backupDir = path.join(DATA_DIR, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  try { fs.copyFileSync(CONTENT_FILE, path.join(backupDir, `content-${stamp}.json`)); } catch {}
  const backups = fs.readdirSync(backupDir).filter(f => f.startsWith('content-')).sort();
  while (backups.length > 20) fs.unlinkSync(path.join(backupDir, backups.shift()));

  writeJson(CONTENT_FILE, incoming);
  res.json({ ok: true });
});

// Image upload
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ ok: true, url: `/uploads/${req.file.filename}` });
  });
});

// Serve uploaded images on Vercel
if (IS_VERCEL) {
  app.use('/uploads', express.static(UPLOADS_DIR));
}

// Enquiries
app.get('/api/admin/enquiries', requireAdmin, (req, res) => {
  res.json(readJson(ENQUIRIES_FILE, []));
});
app.patch('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
  const enquiries = readJson(ENQUIRIES_FILE, []);
  const item = enquiries.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  const allowed = ['new', 'contacted', 'quoted', 'confirmed', 'archived'];
  if (req.body.status && allowed.includes(req.body.status)) item.status = req.body.status;
  writeJson(ENQUIRIES_FILE, enquiries);
  res.json({ ok: true, item });
});
app.delete('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
  let enquiries = readJson(ENQUIRIES_FILE, []);
  const before = enquiries.length;
  enquiries = enquiries.filter(e => e.id !== req.params.id);
  if (enquiries.length === before) return res.status(404).json({ error: 'Not found' });
  writeJson(ENQUIRIES_FILE, enquiries);
  res.json({ ok: true });
});

// 404
app.use((req, res) => {
  res.status(404).send('<meta http-equiv="refresh" content="2;url=/"><body style="font-family:sans-serif;text-align:center;padding-top:20vh;background:#F0E7DE;color:#0B1842"><h1>404</h1><p>Page not found. Redirecting…</p></body>');
});

// Vercel export
module.exports = app;

// Local dev
if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`raqt fuel running at http://localhost:${PORT}`);
    console.log(`Admin panel:        http://localhost:${PORT}/admin`);
  });
}
