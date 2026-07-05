---
name: Celestial Gastronomy
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#45464d'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#625e59'
  on-secondary: '#ffffff'
  secondary-container: '#e8e1db'
  on-secondary-container: '#68645f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e8e1db'
  secondary-fixed-dim: '#ccc5c0'
  on-secondary-fixed: '#1e1b18'
  on-secondary-fixed-variant: '#4a4642'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  cream-surface: '#FDFCFB'
  paper-white: '#F4F1EE'
  ink-blue: '#0A0F1C'
  accent-gold: '#C5A059'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  button-text:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 32px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

This design system embodies the intersection of heritage London luxury and modern culinary artistry. The aesthetic is rooted in **Minimalism** with a focus on editorial-grade whitespace, allowing high-fidelity photography of vibrant Mediterranean-inspired dishes to serve as the primary visual driver. 

The personality is sophisticated and authoritative, yet avoids the coldness of traditional corporate luxury by using a warm, organic base palette. The user experience should feel like a private consultation: effortless, spacious, and meticulously curated. We avoid visual clutter, relying instead on exquisite typography and precise alignment to convey a sense of "quiet luxury."

## Colors

The palette is anchored by a triad of warm neutrals: **Cream-surface** for large backgrounds, **Paper-white** for section differentiation, and **Deep Navy (Ink Blue)** for high-contrast interactive elements and primary text. 

- **Primary Accents:** Use the Deep Navy for all call-to-action buttons, headers, and iconography to maintain a strong, professional "anchor."
- **Surfaces:** Large-scale layouts should utilize the Light Beige (#F9F2EC) and Cream to create a tactile, parchment-like feel that references high-end menu printing.
- **Emphasis:** A subtle metallic gold may be used sparingly for dividers or micro-details to reinforce the premium nature of the service.

## Typography

This system utilizes a high-contrast typographic pairing. **Libre Caslon Text** provides the classic London editorial feel, evoking tradition and culinary excellence. It should be used for all storytelling headers and pull-quotes.

**Hanken Grotesk** serves as the functional counterpart. Its clean, sharp geometry balances the serif's warmth with contemporary precision. 

- **Hierarchy:** Use the `label-caps` for category markers (e.g., "THE MENU," "OUR PHILOSOPHY") to create a structured, organized feel.
- **Readability:** Maintain generous line height for body text to ensure the reading experience remains relaxed and approachable.
- **Special Case:** Italicize the serif font for sub-headings or poetic descriptors to lean into the gourmet aesthetic.

## Layout & Spacing

The layout philosophy is defined by **expansive margins** and a **12-column fixed grid** on desktop. Space is used as a luxury commodity; components are never crowded.

- **Photography:** Food imagery should often break the grid or occupy 50% to 100% of the viewport width to emphasize the sensory experience.
- **Section Gaps:** Vertical spacing between major sections is aggressive (120px+) to ensure each culinary "story" has its own moment of focus.
- **Mobile:** Transition to a single-column flow with 20px side margins, but maintain the vertical breathing room between elements.

## Elevation & Depth

To maintain a sophisticated and flat editorial look, this system rejects heavy shadows in favor of **Tonal Layering**. 

- **Surfaces:** Use subtle shifts between Cream and Paper-white to differentiate content blocks.
- **Outlines:** Use "Ghost Borders"—ultra-thin (1px) lines in a slightly darker neutral—to define input fields or card boundaries without adding visual weight.
- **Overlays:** For navigation or modals, use high-blur backdrops with a 90% opacity cream tint to simulate thick, frosted vellum paper.

## Shapes

The design system uses **Sharp (0px)** corners for all structural elements including buttons, input fields, and image containers. This "architectural" approach reinforces the high-end, premium positioning and aligns with luxury menu design. 

In rare cases where interactive elements need soft differentiation (like selection indicators), use a circular (pill) shape, but never a standard rounded rectangle.

## Components

### Buttons
Primary buttons are solid Deep Navy rectangles with white, uppercase Hanken Grotesk text. Secondary buttons are "Ghost" style—thin 1px Deep Navy borders with no fill. Hover states involve a subtle color shift to a slightly lighter blue or a very thin underline.

### Input Fields
Underline-only or 1px bordered boxes with no roundedness. Placeholder text should be in a light-grey Hanken Grotesk. Focus states should be indicated by the border color deepening to the primary navy.

### Cards
Cards are defined by their content rather than containers. Use large-scale imagery at the top, followed by a Caslon header and Hanken body text. No shadows; use whitespace and subtle dividers to separate cards in a grid.

### Lists & Menus
Menu items should be presented with classic editorial formatting: The dish name in serif, followed by a dotted leader or wide spacing, then the description in a smaller sans-serif.

### Additional Elements
- **Horizontal Dividers:** 1px thick, spanning the width of the container in a light neutral shade.
- **Image Overlays:** Use text-on-image sparingly, ensuring high-contrast Navy text on light image areas or utilizing a subtle cream-tinted wash over the photo.