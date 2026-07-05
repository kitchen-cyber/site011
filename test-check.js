// Quick smoke test of rendered pages (UTF-8 safe, unlike PowerShell)
(async () => {
  const checks = [];
  const index = await fetch('http://localhost:3000/').then(r => r.text());
  checks.push(['index: star suffix', index.includes('★')]);
  checks.push(['index: hero tag', index.includes("London&#39;s Private Dining") || index.includes("London's Private Dining")]);
  checks.push(['index: copyright', index.includes('© 2026 raqt fuel')]);
  checks.push(['index: hero title <br>', index.includes('We Cook<br>Anything You Crave')]);
  checks.push(['index: tel link', index.includes('tel:+442079460238')]);
  checks.push(['index: mailto link', index.includes('mailto:hello@raqtfuel.com')]);
  checks.push(['index: --container defined', index.includes('--container: 1200px')]);
  checks.push(['index: hamburger ink', index.includes('.nav-toggle span {\n  width: 24px; height: 1.5px;\n  background: var(--ink);')]);
  checks.push(['index: local hero bg', index.includes('/img/hero-bg.jpg')]);
  checks.push(['index: preloader logo', index.includes('/img/logo-preloader.png')]);
  checks.push(['index: form has names', index.includes('name="firstName"')]);
  checks.push(['index: honeypot', index.includes('name="website"')]);
  checks.push(['index: dynamic gallery count', index.includes('1 / 8')]);
  checks.push(['index: reduced motion', index.includes('prefers-reduced-motion')]);
  checks.push(['index: meta description', index.includes('<meta name="description"')]);
  checks.push(['index: schema.org', index.includes('application/ld+json')]);
  checks.push(['index: no cyrillic filenames', !/%D0|%D1|лип/.test(index)]);

  const team = await fetch('http://localhost:3000/team').then(r => r.text());
  checks.push(['team: renders members', team.includes('Marcus Thorne') && team.includes('Priya Kapoor')]);
  checks.push(['team: local logo', team.includes('/img/logo-nav.png')]);
  checks.push(['team: hamburger ink', team.includes('background: var(--ink);')]);
  checks.push(['team: values', team.includes('No Limits')]);

  const admin = await fetch('http://localhost:3000/admin').then(r => r.text());
  checks.push(['admin: page served', admin.includes('Адмін-панель')]);

  const redirect = await fetch('http://localhost:3000/index.html', { redirect: 'manual' });
  checks.push(['legacy redirect 301', redirect.status === 301]);

  const notFound = await fetch('http://localhost:3000/nope');
  checks.push(['404 page', notFound.status === 404]);

  let fail = 0;
  for (const [name, ok] of checks) {
    console.log((ok ? 'PASS' : 'FAIL') + '  ' + name);
    if (!ok) fail++;
  }
  console.log(fail === 0 ? '\nALL PASSED' : `\n${fail} FAILED`);
  process.exit(fail === 0 ? 0 : 1);
})();
