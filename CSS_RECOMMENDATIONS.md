/* ============================================
   DETAILED CSS FIXES - raqt fuel UI/UX Audit
   ============================================ */

/* PRIORITY 1: TOUCH TARGETS & ACCESSIBILITY */

/* Fix 1.1: Navigation Toggle Button - INCREASE TO 44x44px */
.nav-toggle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  background: none;
  border: none;
  width: 44px;        /* Changed from implicit */
  height: 44px;       /* Changed from implicit */
  padding: 10px;      /* Changed from 4px */
  align-items: center;
  justify-content: center;
}

/* Fix 1.2: Footer Links - Add Touch Padding */
footer a {
  color: rgba(253,252,251,0.7);  /* Improved from 0.5 */
  text-decoration: none;
  font-size: 14px;
  display: block;
  padding: 12px 0;               /* NEW */
  min-height: 44px;              /* NEW */
  display: flex;                 /* NEW */
  align-items: center;           /* NEW */
  transition: color 0.3s;
  margin-bottom: 0;              /* Changed from 10px */
}

/* Fix 1.3: Navigation CTA Button - Increase Padding */
.nav-cta {
  background: var(--gold) !important;
  color: var(--ink) !important;
  padding: 12px 24px;            /* Changed from 10px 24px */
  font-weight: 600 !important;
  transition: opacity 0.3s, transform 0.3s !important;
  border-radius: var(--radius-sm) !important;
}

/* Fix 1.4: Contact Detail Icons - Responsive Touch Targets */
.contact-detail-icon {
  width: clamp(36px, 8vw, 44px);  /* Changed from 36px fixed */
  height: clamp(36px, 8vw, 44px); /* Changed from 36px fixed */
  min-width: 36px;                /* NEW */
  min-height: 36px;               /* NEW */
  border: 1px solid var(--gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: var(--font-serif);
  font-size: 13px;
  color: var(--gold);
  background: rgba(212,197,178,0.06);
}

/* Fix 1.5: Form Fields - Ensure 44px Minimum Height */
.contact-form input,
.contact-form textarea,
.contact-form select {
  width: 100%;
  min-height: 44px;               /* NEW */
  padding: clamp(12px, 2vw, 14px) clamp(12px, 2vw, 16px);
  background: var(--paper);
  border: 1px solid rgba(212,197,178,0.4);  /* NEW - was transparent */
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.3s, background 0.3s;
}

/* PRIORITY 2: COLOR CONTRAST IMPROVEMENTS */

/* Fix 2.1: Secondary Text Contrast */
.section-text {
  font-size: 17px;
  line-height: 1.8;
  color: rgba(10,15,28,0.75);     /* Changed from 0.65 */
  max-width: 600px;
}

/* Fix 2.2: Contact Detail Text Contrast */
.contact-detail-text {
  font-size: 15px;
  color: rgba(10,15,28,0.75);     /* Changed from 0.65 */
  line-height: 1.5;
}

/* Fix 2.3: Menu Card Description Contrast */
.menu-card-desc {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(10,15,28,0.75);     /* Changed from 0.5 */
}

/* Fix 2.4: Footer Text Contrast Improvement */
footer p,
footer a {
  color: rgba(253,252,251,0.7);   /* Changed from 0.5 */
}

/* Fix 2.5: Stats Label Contrast */
.stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(253,252,251,0.65);  /* Changed from 0.45 */
}

/* Fix 2.6: Service Card Text Contrast */
.service-card p {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(253,252,251,0.65);  /* Changed from 0.55 */
  max-width: 380px;
  margin: 0 auto;
}

/* PRIORITY 3: MENU SECTION - CRITICAL SPACING FIX */

/* Fix 3.1: Menu Grid Gap - CRITICAL */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;                      /* Changed from 2px - CRITICAL */
  background: transparent;        /* Changed from rgba(10,15,28,0.06) */
}

/* Fix 3.2: Menu Card Styling - Add Borders & Rounding */
.menu-card {
  background: var(--cream);
  padding: clamp(40px, 5vw, 48px) clamp(32px, 6vw, 40px);
  transition: all 0.3s;           /* Changed from 0.3s background only */
  position: relative;
  border: 1px solid rgba(212,197,178,0.2);  /* NEW */
  border-radius: 12px;            /* NEW */
}

.menu-card:hover {
  background: rgba(212,197,178,0.05);  /* Changed from #fafafa */
  border-color: var(--gold);           /* NEW */
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);  /* NEW */
}

/* Fix 3.3: Remove Top Border Element from Cards */
.menu-card::before {
  display: none;                  /* Changed from content: '' */
}

/* Fix 3.4: Remove Hover Border Animation */
.menu-card::after {
  display: none;
}

/* Fix 3.5: Responsive Menu Grid */
@media (max-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* PRIORITY 4: RESPONSIVE DESIGN - PHILOSOPHY SECTION */

/* Fix 4.1: Philosophy Image - Better Proportion */
.philosophy-image {
  position: relative;
  width: clamp(30%, 38vw, 45%);   /* Changed from 26vw */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 5;            /* NEW - locks aspect ratio */
}

/* Fix 4.2: Philosophy Grid - Remove 100vh Min Height */
.philosophy-grid {
  display: flex;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  min-height: auto;               /* Changed from 100vh */
  align-items: stretch;
  gap: 40px;
}

/* Fix 4.3: Philosophy Content - Better Padding */
.philosophy-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(40px, 6vw, 60px);  /* Changed from 80px 80px 80px 70px */
  max-width: 540px;
}

/* Fix 4.4: Tablet Philosophy Layout */
@media (max-width: 1024px) and (min-width: 768px) {
  .philosophy { flex-direction: row; }
  .philosophy-grid { flex-direction: row; }
  .philosophy-image {
    width: 40%;
    flex-shrink: 0;
    height: auto;
    min-height: 60vh;
  }
  .philosophy-content { flex: 1; }
}

/* Fix 4.5: Mobile Philosophy - Correct Order */
@media (max-width: 768px) {
  .philosophy { flex-direction: column; }
  .philosophy-grid { flex-direction: column; }
  .philosophy-image { order: -1; }  /* NEW - shows image first */
  .philosophy-content { order: 0; }
}

/* PRIORITY 5: VISUAL DEPTH & SHADOWS */

/* Fix 5.1: Testimonial Cards - Add Shadows */
.testimonial-card {
  padding: clamp(32px, 5vw, 40px);
  border: 1px solid rgba(10,15,28,0.12);  /* Changed from 0.08 */
  background: rgba(10,15,28,0.02);        /* NEW */
  border-radius: 12px;                    /* NEW */
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); /* NEW */
  transition: all 0.3s;
}

.testimonial-card:hover {
  border-color: var(--gold);
  background: rgba(10,15,28,0.05);        /* Changed from 0.03 */
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);  /* NEW */
}

/* Fix 5.2: Gallery Figures - Add Shadows & Rounding */
.gallery-fig {
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  width: clamp(60vw, 70vw, 85vw);
  height: clamp(55vh, 65vh, 75vh);
  border-radius: 8px;              /* NEW */
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);  /* NEW */
}

.gallery-fig img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;              /* NEW */
}

/* Fix 5.3: Gallery Track - Increase Gap */
.gallery-track {
  display: flex;
  align-items: center;
  gap: 12px;                       /* Changed from 4px */
  will-change: transform;
  padding: 0 var(--gutter);
}

/* Fix 5.4: Navigation Blur Intensity */
.nav-wrap.scrolled {
  background: rgba(240,231,222,1);
  backdrop-filter: blur(12px);     /* Changed from 20px */
  -webkit-backdrop-filter: blur(12px);
  padding: 0 24px;
}

/* PRIORITY 6: HERO SECTION IMPROVEMENTS */

/* Fix 6.1: Hero Overlay Contrast */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);   /* Changed from 0.2 */
  pointer-events: none;
  z-index: 1;
}

/* Fix 6.2: Hero Button Shadow */
.hero-btn {
  display: inline-block;
  padding: 16px 40px;
  background: var(--gold);
  color: var(--ink);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 0.3s;            /* Changed from 0.3s */
  opacity: 0;
  animation: fadeUp 0.8s 0.9s forwards;
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);  /* NEW */
}

.hero-btn:hover {
  opacity: 0.85;
  transform: translateY(-3px);     /* Changed from -2px */
  box-shadow: 0 6px 24px rgba(0,0,0,0.3);  /* NEW */
}

/* PRIORITY 7: NAVIGATION TEXT SIZING */

/* Fix 7.1: Navigation Links Better Size */
.nav-links a {
  text-decoration: none;
  color: var(--ink);
  font-size: clamp(13px, 1.5vw, 14px);  /* Changed from 12px */
  font-weight: 500;
  letter-spacing: 0.14em;          /* Changed from 0.12em */
  text-transform: uppercase;
  transition: color 0.3s;
  position: relative;
}

/* PRIORITY 8: SERVICES SECTION IMPROVEMENTS */

/* Fix 8.1: Service Card Hover Effect */
.service-card {
  position: relative;
  padding: 60px 48px;
  text-align: center;
  transition: all 0.3s;            /* Changed from background only */
  border: 1px solid rgba(212,197,178,0.15);  /* NEW */
  border-radius: 8px;              /* NEW */
}

.service-card:hover {
  background: rgba(253,252,251,0.08);  /* Changed from 0.04 */
  transform: translateY(-4px);     /* NEW */
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);  /* NEW */
}

/* Fix 8.2: Service Card Responsive Grid */
@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* PRIORITY 9: FORM FIELD IMPROVEMENTS */

/* Fix 9.1: Custom Select Styling */
.contact-form select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230B1842' d='M1 4l5 4 5-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

/* Fix 9.2: Form Focus States with Outline */
.contact-form input:focus,
.contact-form textarea:focus,
.contact-form select:focus {
  border-color: var(--gold);
  background: var(--cream);
  box-shadow: 0 0 0 3px rgba(212,197,178,0.15);  /* NEW */
  outline: 2px solid var(--gold);
  outline-offset: 0;
}

/* PRIORITY 10: FOOTER SPACING */

/* Fix 10.1: Footer Grid at Tablet */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 60px;
  }
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

/* LOW PRIORITY: NICE TO HAVE */

/* Optional: Testimonial Quote Responsiveness */
.testimonial-card::before {
  content: '\201C';
  position: absolute;
  top: clamp(8px, 3vw, 16px);    /* NEW - responsive */
  left: clamp(10px, 3vw, 24px);  /* NEW - responsive */
  font-family: var(--font-serif);
  font-size: clamp(32px, 10vw, 64px);  /* NEW - responsive */
  line-height: 1;
  color: var(--deco-color);
  pointer-events: none;
}

/* Optional: Gallery Progress Bar Thickness */
.gallery-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;                    /* Changed from 3px */
  background: var(--gold);
  z-index: 2;
}

/* Optional: Stats Grid Improvements */
.stat-num {
  font-family: var(--font-serif);
  font-size: clamp(32px, 6vw, 72px);  /* Changed from 44px-72px */
  color: var(--cream);
  line-height: 1;
  margin-bottom: 8px;
}

/* Optional: Better Placeholder Contrast */
.contact-form input::placeholder,
.contact-form textarea::placeholder {
  color: rgba(10,15,28,0.4);      /* Changed from 0.3 */
}

/* ============================================
   END OF CSS RECOMMENDATIONS
   ============================================ */
