require('dotenv').config();
const express = require('express');
const cookieSession = require('cookie-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;
const IS_PROD = process.env.NODE_ENV === 'production' || IS_VERCEL;

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  if (IS_VERCEL && req) return `https://${req.hostname}`;
  return `http://localhost:${PORT}`;
}

// ── Supabase config ──
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// ── Email config (Resend) ──
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kitchen@table42.co.uk';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const DATA_DIR = IS_VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const UPLOADS_DIR = IS_VERCEL ? '/tmp/uploads' : path.join(__dirname, 'public', 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Seed content.json on Vercel (read-only filesystem, copy from repo to /tmp)
if (IS_VERCEL && !supabase) {
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
async function getContent() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('data')
        .eq('id', 1)
        .single();
      if (error) throw error;
      return data?.data || {};
    } catch (err) {
      console.error('[getContent error]', err.message);
      return {};
    }
  }
  return readJson(CONTENT_FILE, {});
}

// ── Consistent secret for sessions & signed cookies ──
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET && IS_PROD) {
  console.warn('[CRITICAL] SESSION_SECRET not set in environment! Set it to fix login on Vercel.');
  console.warn('[CRITICAL] Run: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

// Helper: parse cookies from request
function parseCookies(req) {
  const cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) cookies[name] = decodeURIComponent(value);
    });
  }
  return cookies;
}

// ── App setup ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));
// Manual session management using base64-encoded cookies (more reliable than cookie-session on serverless)
app.use((req, res, next) => {
  const cookies = parseCookies(req);
  const sessionCookie = cookies.raqt_sid;
  
  // Parse existing session
  req.session = {};
  if (sessionCookie) {
    try {
      const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
      req.session = JSON.parse(decoded);
    } catch (err) {
      console.error('[Session parse error]', err.message);
    }
  }
  
  // Intercept res.end() to save session cookie
  const originalEnd = res.end.bind(res);
  res.end = function(...args) {
    if (Object.keys(req.session).length > 0) {
      const sessionJSON = JSON.stringify(req.session);
      const sessionB64 = Buffer.from(sessionJSON).toString('base64');
      res.cookie('raqt_sid', sessionB64, {
        httpOnly: true,
        sameSite: 'lax',
        secure: IS_PROD,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/'
      });
    } else if (sessionCookie) {
      // Clear session if empty
      res.clearCookie('raqt_sid', { path: '/' });
    }
    originalEnd(...args);
  };
  
  next();
});

// Middleware: verify admin status from email, not trusting session data
function verifyAdminStatus(req, res, next) {
  try {
    if (req.session.user) {
      req.session.user.isAdmin = ADMIN_EMAILS.includes(String(req.session.user.email || '').toLowerCase());
    }
    // Debug: log all incoming requests with session
    if (req.path.startsWith('/api/auth') || req.path === '/') {
      console.log(`[${req.method} ${req.path}] session.user=${req.session.user ? req.session.user.email : 'EMPTY'}`);
    }
  } catch (err) {
    console.error('[verifyAdminStatus error]', err.message);
  }
  next();
}
app.use(verifyAdminStatus);

function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// ── Public pages ──
app.get('/', async (req, res) => {
  const c = await getContent();
  res.render('index', { c, nl2br });
});
app.get('/team', async (req, res) => {
  const c = await getContent();
  res.render('team', { c, nl2br });
});
app.get('/index.html', (req, res) => res.redirect(301, '/'));
app.get('/team.html', (req, res) => res.redirect(301, '/team'));

// ── Public API: enquiry form ──
app.post('/api/enquiry', async (req, res) => {
  const { firstName, lastName, email, phone, eventType, guestCount, message, website } = req.body || {};
  if (website) return res.json({ ok: true });
  if (!firstName || !lastName || !email || !eventType || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const enquiry = {
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
  };

  // Save to file
  const enquiries = readJson(ENQUIRIES_FILE, []);
  enquiries.unshift(enquiry);
  writeJson(ENQUIRIES_FILE, enquiries);

  // Send email via Resend
  if (resend) {
    try {
      await resend.emails.send({
        from: 'noreply@raqtfuel.com',
        to: ADMIN_EMAIL,
        subject: `New Enquiry from ${enquiry.firstName} ${enquiry.lastName}`,
        html: `
          <h2>New Enquiry Received</h2>
          <p><strong>Name:</strong> ${enquiry.firstName} ${enquiry.lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${enquiry.email}">${enquiry.email}</a></p>
          <p><strong>Phone:</strong> ${enquiry.phone || '(not provided)'}</p>
          <p><strong>Event Type:</strong> ${enquiry.eventType}</p>
          <p><strong>Guest Count:</strong> ${enquiry.guestCount || '(not specified)'}</p>
          <h3>Message:</h3>
          <p>${enquiry.message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><a href="https://${req.hostname}/admin">View in Admin Panel</a></p>
        `
      });
      console.log('[Email sent]', { to: ADMIN_EMAIL, enquiryId: enquiry.id });
    } catch (err) {
      console.error('[Email error]', err.message);
      // Don't fail the request if email fails - enquiry is already saved
    }
  }

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
  // Store state in simple cookie (no signing issues on serverless)
  res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure: IS_PROD, maxAge: 5 * 60 * 1000 });
  console.log('[OAuth Start] State cookie set:', state);
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
    const cookies = parseCookies(req);
    const stateFromCookie = cookies.oauth_state;
    console.log('[OAuth Callback]', {
      state_from_query: state,
      state_from_cookie: stateFromCookie,
      all_raw_cookies: Object.keys(cookies)
    });
    if (req.query.error) {
      return res.redirect(`/admin?setup=1&uri=${encodeURIComponent(getBaseUrl(req) + '/auth/google/callback')}&error=${req.query.error}`);
    }
    // Verify state from cookie
    if (!code || !state || state !== stateFromCookie) {
      console.error('[OAuth] State mismatch or missing code', { code, state, stateFromCookie });
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
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokenRes.status} ${tokenRes.statusText}`);
    const tokens = await tokenRes.json();
    console.log('[OAuth] Token exchange success');

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    if (!userRes.ok) throw new Error(`Userinfo failed: ${userRes.status} ${userRes.statusText}`);
    const profile = await userRes.json();
    console.log('[OAuth] User profile retrieved:', { email: profile.email, name: profile.name });

    const email = String(profile.email || '').toLowerCase();
    if (!profile.email_verified) {
      console.warn('[OAuth] Email not verified:', email);
      return res.redirect('/?error=email_not_verified');
    }

    req.session.user = {
      email,
      name: profile.name || email,
      picture: profile.picture || '',
      isAdmin: ADMIN_EMAILS.includes(email)
    };
    console.log('[OAuth] Session user set:', { email, isAdmin: ADMIN_EMAILS.includes(email) });
    console.log('[OAuth] About to redirect to / with session:', req.session);
    res.redirect('/');
  } catch (err) {
    console.error('[OAuth ERROR]', err.message, err.stack);
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
  req.session = {}; // Clear session (middleware will remove cookie)
  res.clearCookie('raqt_sid', { path: '/' });
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
app.get('/api/admin/content', requireAdmin, async (req, res) => {
  const content = await getContent();
  res.json(content);
});

app.put('/api/admin/content', requireAdmin, async (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Invalid content' });
  }

  if (supabase) {
    // Save to Supabase
    try {
      const { error } = await supabase
        .from('content')
        .update({ 
          data: incoming,
          updated_at: new Date().toISOString(),
          updated_by: req.session.user?.email || 'unknown'
        })
        .eq('id', 1);
      if (error) throw error;
      console.log('[Content saved to Supabase]', { by: req.session.user?.email });
      return res.json({ ok: true });
    } catch (err) {
      console.error('[Supabase save error]', err.message);
      return res.status(500).json({ error: 'Failed to save content' });
    }
  }

  // Fallback to file system (local dev)
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
