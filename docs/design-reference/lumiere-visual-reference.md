# Visual reference — "Lumière" luxury jewelry concept

Source: `lumiere-visual-reference.png` in this same folder (saved from a reference image
the user provided on 2026-10-07). This is a design *mood/structure* reference for Shin
Orne's ongoing luxury redesign — not a literal brand to copy (the name "Lumière", its
wordmark, and its exact product photography are that reference's own branding and are
NOT to be reproduced verbatim). What we're borrowing is the **visual language**: dark
jewel-toned luxury, glass/glow effects, and a flowing, continuously-layered page.

## Overall mood

- Near-black background throughout (not pure black — warm charcoal/espresso tones) with
  gold/amber light as the recurring accent color. Every section stays dark; nothing
  switches to a white/light section (the current Shin Orne site is light/cream — this
  reference argues for a dark luxury direction, which is a bigger decision than a photo
  swap and should be confirmed with the user before a wholesale theme change).
- A continuous **flowing gold ribbon/smoke motif** (looks like a liquid-gold or light-trail
  shape) snakes down through the entire page as connective tissue between sections —
  not confined to one hero banner. It reappears, thinner and more subtle, as a divider
  between sections lower on the page. This is the biggest "flowy" element the user is
  pointing at.
- Diamonds/gems are scattered as floating decorative elements (bokeh-lit, soft shadows)
  independent of the product photography — a layering/depth cue, not just product shots.
- Fine gold "light ray" streaks emanate from the top of the hero, like a spotlight — a
  subtle vibrance cue behind the headline.

## Section-by-section breakdown (top to bottom)

1. **Header** — slim, transparent-over-image. Serif wordmark left ("LUMIÈRE"), text nav
   (Shop / Collections / About / Journal) center-left, a pill-shaped search bar center-right,
   then wishlist/account/cart icons far right. Minimal, all thin-weight, lots of letter-spacing.

2. **Hero** — large serif headline ("More Than Jewelry — It's Your Story") over the dark
   gold-smoke background, left-aligned text, two CTAs (solid gold-outline button + a
   "watch the film" ghost link with a play icon). A hero product shot (a ring on dark rock)
   sits right-of-center, slightly tilted/floating, with a small "shoppable" card
   pinned near it (product name, material, price, a quick-add `+` button) — a
   shoppable-hotspot pattern worth reusing on Shin Orne's hero or product imagery.
   Bottom-left shows a slide counter ("01 / 04") implying the hero is a carousel.

3. **Featured Collections** — "Iconic Pieces for Modern Love." Four tall image tiles in a
   row (rings / necklaces / earrings / bracelets), each a full-bleed photo with a
   bottom-left dark gradient overlay carrying the collection name, a one-line price-from,
   and a small arrow icon. Numbered corner badges (01–04) on each tile.

4. **Customize / Design a Ring** — a two-column "build your own" feature: lifestyle photo
   of a model's hand/ring on the left, and on the right a **glass-panel configurator card**
   — this is the clearest "glass effect" element: a semi-transparent, blurred-glass panel
   (frosted/glassmorphism) floating over the dark background, containing tabs (Center
   Stone / Setting / Metal / Engraving), a diamond-shape picker, metal-color swatches, a
   size stepper, live price, and an "Add to Cart" button. Three small trust icons underneath
   (Real-time 3D Preview / Ethical Sourcing / Lifetime Care).

5. **Size Guide + Craftsmanship** — split section. Left: a compact "glass card" again (Size
   Guide) with a ring-sizer illustration and a live size readout. Right: "The Art of True
   Craftsmanship" — a 5-step horizontal process strip (Sourcing → Design → Crafting →
   Setting → Final Reveal), each step a small circular icon in sequence connected by a
   thin line, beside a large process photo (hands setting a stone).

6. **Gemstone picker** — "Nature's Rarest Treasures." A row of 6 large faceted gem
   renders (diamond, sapphire, emerald, ruby, morganite, tanzanite) each labeled with
   name + one-word emotional tag (Timeless / Wisdom / Renewal / Passion / Love /
   Transformation) — a nice pattern for Shin Orne's own gemstone-driven customization step.

7. **AI Stylist** — a chat-style panel ("Kira, AI Stylist") on a glass card: avatar,
   a sample assistant message, quick-reply style chips (Classic & Timeless / Modern & Bold
   / Romantic & Soft / Minimal & Chic), and a recommended-product mini-card beside it.

8. **Personalized Recommendations** — a 4-up product grid, each card with a wishlist heart,
   image, name, price, and a star-rating + review count — standard but consistently dark/glass
   styled to match the rest of the page rather than reverting to plain white cards.

9. **Social proof gallery** — "Real People, True Moments." A horizontal strip of real-life
   customer photos (hands, couples, close-ups) with a `#LumièreJewelry` hashtag CTA, one
   tile playable as a video.

10. **Testimonials** — 3 quote cards side by side, avatar + name/location + 5-star rating,
    on the same dark/glass card treatment, plus an aggregate rating line ("4.9/5 from
    10,000+ customers").

11. **Footer** — dark, same tone as the rest of the page (not a separate lighter block),
    newsletter signup with a pill input + circular gold submit button, then a 4-column
    link layout (Shop / About / Customer Care / social icons), closing with a one-line
    tagline ("A Legacy of Love, Crafted Forever").

## Reusable technique checklist for Shin Orne

- [ ] Introduce a glassmorphism card component (`backdrop-blur` + translucent dark
      background + thin light border) for configurator/size-guide/AI-stylist-style panels —
      Shin Orne doesn't have this treatment yet; everything is opaque white cards.
- [ ] A continuous decorative "flow" element (gradient ribbon / light trail) that runs
      behind multiple sections rather than resetting per-section — could be an SVG path or
      a tall background image/gradient layered behind the whole page, not per-component.
- [ ] Floating/bokeh decorative elements (gems, light particles) layered independently of
      photography for depth.
- [ ] Shoppable hotspot card pinned to a hero/lifestyle image (name + material + price +
      quick-add), distinct from the existing PromoBanner pattern.
- [ ] Numbered corner badges on collection tiles.
- [ ] A process-step strip for craftsmanship storytelling (Shin Orne's `CraftsmanshipSection`
      already has a 4-step version — this reference suggests a more visual, icon-connected-
      by-a-line treatment rather than a plain 2-col grid).
- [ ] Gemstone picker grid tied to real gemstone options for customization (Phase 2 of the
      redesign already calls for gemstone selection — this is good visual inspiration for it).

## Open question before building any of this

This reference is a **dark, jewel-toned** theme. Shin Orne's current theme (`#D4AF37` gold
accent on white/cream, warm neutrals) is light. Adopting the glass-panel/flow-ribbon/bokeh
techniques does not require going fully dark — they could be adapted into the existing
light palette (e.g. a warm cream glass-blur instead of a dark one). Whether to shift Shin
Orne to a dark luxury theme like this reference, or to keep the current light palette and
borrow only the *techniques* (glass cards, flowing connective graphics, shoppable hotspots),
is a real design decision, not just scope — worth confirming before any phase builds on it.
