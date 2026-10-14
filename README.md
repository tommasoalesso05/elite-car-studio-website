# Élite Car Studio

Clone of the EAD Milano car-detailing layout, re-branded to **Élite Car Studio**.
Reference captures live in this folder: `clonedetailing.png` (full page, truncated at
Chrome's 16384px limit), `clonedetailing2.png` (CTA), `clonedetailing3.png` (footer).

## Run

From the repo root (`Website building/`):

```
node serve.mjs
```

Then open <http://localhost:3000/Sito%20papà/>

## Files

| File | What it holds |
|---|---|
| `index.html` | All markup, 9 sections: nav, hero, servizi, processo, archivio, numeri, recensioni, consulto, footer |
| `styles.css` | Design tokens + every section style |
| `script.js` | Nav, booking form, scroll reveals, stat counters, project carousel |
| `waves.js` | Wave field behind the closing section (ES module) |
| `vendor/` | `simplex-noise.js` 4.0.3 (MIT) + its licence |
| `assets/` | `hero.mp4` — the hero background video |

## Type

Deliberately not the reference's type system. The cloned site ran a very wide geometric
display face (matched here originally by Panchang and Chillax), which is most of what made
the two look alike. Replaced with:

- **Cabinet Grotesk** (Fontshare) — display: hero, section headings, stats, card and step
  titles, quotes, the logo. Tighter and more editorial than the wide geometric original,
  one family at two weights instead of two families.
- **Supreme** (Fontshare) — body copy, and the italic accents (`Milano`, `Selection`);
  Cabinet Grotesk ships no italic, Supreme does.
- **IBM Plex Mono** — every tracked uppercase label, in place of Space Mono.

Display sizes were scaled by 1.039 across the board so the optical cap height is unchanged
through the swap: Cabinet Grotesk has a 0.670 cap ratio against Panchang's 0.696. Layout,
column widths and the hero's headline/form clearance are therefore unaffected.

## Wave field

The closing section (`Dai nuova vita alla tua auto`) sits on an animated field of vertical
lines pushed around by 2D simplex noise, with the pointer shoving nearby points aside. It is
the 21st.dev `Waves` React component ported to vanilla JS in `waves.js`, loaded as
`<script type="module">`.

The field runs from the top of that section to the bottom of the footer, so the lines carry
on to the end of the page. `waves.js` sets its height from the two elements' rects (and
again after `document.fonts.ready`, since the footer's height settles when the webfonts
land). `.consulto` does not clip, and the footer paints after it, so footer content sits on
top of the overflow — both the WhatsApp button and the footer links were checked with
`elementFromPoint`.

`simplex-noise` 4.0.3 is vendored into `vendor/simplex-noise.js` (18KB ESM, MIT, licence
alongside it) rather than added to `package.json` — this site has no build step, so an npm
dependency could not be resolved at runtime.

Colour is `currentColor` on `.waves` set to `var(--accent)` at `.5` opacity, so the lines
are the house red on the black. Two masks multiply to dissolve the field on all four edges —
a long vertical fade (transparent → solid at 16%, back out from 92%, now measured over the
section-plus-footer height) and a gentler horizontal one — so there is no seam against the
reviews above, and the lines dissolve into the very bottom of the page rather than stopping.

Five things differ from the original component, all deliberate:

- **It never takes pointer events.** The contact links and the two buttons sit on top of it
  and stay clickable — checked with `elementFromPoint` at the WhatsApp button's centre.
- **The touchmove handler is gone.** The original calls `preventDefault()` on it, which
  would stop the page scrolling on a phone — fatal for something behind content.
- **It only animates while the section is on screen** (IntersectionObserver), rather than
  running for the whole page.
- **The cursor dot is dropped.** It belongs in a full-screen demo, not behind a paragraph.
- **The lines are curves, not segments.** The original joins its points with straight `L`
  commands, which leaves a corner at every point. Here each point is the control handle of a
  quadratic ending at the midpoint of the next span — the standard smoothing trick, and
  C1-continuous, so there are no corners at all. A path is 79 `Q` commands and a single
  closing `L`.

Density is far coarser than the original's 8px grid, which would be ~20k points redrawn per
frame across an area this size. At 22×26px it is 73 paths of 66 points — about 4.8k over the
full section-plus-footer height — and measures 16.7ms average frame time, so a steady 60fps. `prefers-reduced-motion: reduce`
draws a single still frame and never starts the loop.

> **Not a React project.** As with the ASCII component earlier, nothing was scaffolded and
> no `/components/ui` folder exists — a `.tsx` file here would never run.

## Stats

Three figures on the black, in one row from 640px up and stacked below: **7+** anni di
esperienza, **600+** veicoli trattati con successo, **2h** tempo massimo per i trattamenti. No boxes — the bordered 2×2 grid is gone, and so is the fourth `2Y` stat.

Each figure and its label are centred in their own column (`text-align:center` plus
`margin-inline:auto` on the label, which is width-capped). The label cap is `28ch`, the
smallest value that keeps all three on one line from 768px up; between 640 and 700px the
columns themselves are too narrow and the longer two wrap, which is the column width doing
it rather than the cap.

This section runs **Supreme** for both the figures and the labels, rather than the Cabinet
Grotesk / IBM Plex Mono pairing everything else uses, and the labels are sentence case
instead of tracked uppercase. That is the whole of the font change here — no fourth family
was loaded.

The figures count up from 0 on an ease-out cubic over 1.1s, fired once by an
IntersectionObserver at 50% visibility. The markup carries the final figure, so with JS off
the numbers are simply correct; they are only zeroed once we know we can animate them back
up. `prefers-reduced-motion: reduce` skips the animation and leaves 7 / 600 / 2 in place.
`font-variant-numeric: tabular-nums` keeps the digits from jittering as they climb.

The `+` and `h` suffixes used to sit in `--accent-dim` (#6e101e), which measures about
1.4:1 on the black. They now share the figure's `--accent` at `.62em`, so they are
distinguished by size rather than by being nearly invisible — they carry meaning.

## Colour

The reference's neon green was swapped for a dark red, `--accent: #b11226`, applied
across the whole accent system — display type, rules, the LIVE dot, the comparison
seam, badges, the solid button and the section washes — so nothing is left green.
Two derived values: `--accent-dim: #6e101e` for the stat unit suffixes, and
`#fff2f3` for text sitting on a red fill (6.45:1).

One trade-off worth knowing: `#b11226` on `#050505` is **2.9:1**, where the old green
was 15.3:1. That reads well at display sizes but puts the 10px mono labels
(`01 // SHIELD`, `// ARCHIVIO`) under the 4.5:1 minimum for small text. If you want
them legible without touching the headline colour, give the small labels their own
lifted red — `#e5405a` hits 4.9:1.

## Hero

Two columns from 1080px up: eyebrow, headline and intro copy on the left, the booking
form on the right, `assets/hero.mp4` playing behind both (H.264, 1920×1080, 14.4s,
faststart). Below 1080px the form stacks under the headline.

The headline steps down to `clamp(36px, 5.6vw, 88px)` in the two-column layout — at the
measured `7.62vw` the words `Studio Milano` are ~845px wide at 1470px and would not fit
beside the form. Every other heading keeps the reference scale.

The video spans the full screen width and keeps its own 16:9 frame rather than being
stretched to the whole hero. Stretching it made `object-fit: cover` crop roughly a third
off each side — the hero is much taller than 16:9 because the form sets its height — which
read as being zoomed in. Its bottom edge is masked into the page background so there is no
hard seam. `min-height: 46vh` stops it collapsing to a thin strip on narrow screens, where
it falls back to cropping (about 57% of the frame width shows at 390px; from 768px up the
whole frame is visible).

Brightness comes from two places, tuned together by sampling rendered pixel luminance
rather than by eye: `filter: brightness(1.45) contrast(1.03)` on the video, and lighter
scrim gradients (lightened again when the form became glass — see Booking form). Mean luminance across the visible frame went from 18 to 27 out of 255
(centre of frame), which keeps the moody look while letting the footage read. If it wants
more, the two levers are that `filter` and the `.hero__scrim` alpha stops.

The `LIVE · Detailing Milano` badge and the `Audio disattivato` toggle are gone: the clip
has no audio track, so the control had nothing to switch. The `viene rifinito a mano`
ghost line went too — it ran straight through the intro paragraph once the column
narrowed.

## Booking form

Glass panel, `#richiesta`. Six fields: nome completo, numero di telefono, indirizzo email,
indirizzo di residenza, di che servizio hai bisogno (the 3 services + Altro), dettagli
addizionali. The first five are required.

Submitting validates in Italian, marks bad fields with `aria-invalid` plus an inline
message, focuses the first one, and otherwise opens a prefilled WhatsApp message via
`https://wa.me/…`. No backend, no network call.

The panel is translucent glass: `rgba(6,6,7,.2)` over `backdrop-filter: blur(26px)
saturate(1.25)`, a crisp `rgba(255,255,255,.3)` hairline, an inset top highlight and a
`::before` that lights the top-left edge only. Legibility comes from the blur, not from
opacity — labels read 6.1:1 against the brightest panel background measured.

Two things had to move for the footage to actually show through: the hero scrim's
right-hand wash dropped from `.5/.68` alpha to `.14/.18` (it existed to protect text on
the old solid panel), and the video's bottom mask now fades from 62% to 100% instead of
ending at 58%. Measured through the glass, the top of the panel sits at 32–36/255 and
varies frame to frame; the bottom third sits at a flat 19.8 because the video's 16:9 frame
has ended by then — that is the limit of a full-width video behind a panel this tall.

> **Needs your WhatsApp number.** It is the `WHATSAPP_NUMBER` constant at the top of
> `script.js`, currently the placeholder `393000000000`. Digits only, country code first,
> no `+` — an Italian mobile looks like `393201234567`.

## Services

Three services, side by side from 900px up and stacked below it: **Pulizia interni**,
**Pulizia esterni**, **Lavaggio tappezzeria**. Title and description only — the
`Scopri di più` links are gone. They were bottom-anchored with `margin-top:auto`, so they
were also what held the cards open; without them the `min-height` dropped from
`clamp(340px, 38vw, 460px)` to `clamp(220px, 20vw, 300px)` and the content sets the height
instead, with the grid equalising each row. That closed 152px of dead space per card at
1470px. The section heading is `I nostri servizi`,
set on a single line at every width — it needs 711px of the 1840px available at 1920, and
243px of 350px at 390, so the fluid scale never has to break. The mono paragraph that ran
beside it (`Ogni trattamento nasce da una diagnosi accurata…`) is gone, so `.sec__head` is
no longer a two-column grid.

The same three replace the old eight everywhere they were listed: the nav dropdown, the
hero form's service select (plus `Altro`), and the footer's services column. The page
`<title>`, the meta description and the footer SEO paragraph were rewritten to match, since
they advertised PPF, nanoceramic and wrapping — services the site no longer offers.

The `La scienza della riflessione` section (Laboratorio PPF, with the before/after
comparison slider) is deleted: markup, its CSS block, and the slider's pointer handlers in
`script.js`, which would have thrown on the missing `#compare`.

## Process steps

Six phases in two rows of three, built from `Screenshot 2026-09-08 at 00.25.54.png`:
Consulenza personalizzata, Valutazione del veicolo, Preparazione delle superfici, Pulizia
professionale, Controllo qualità, Consegna. Red ring and red number, white title, grey copy.

Proportions came off that crop: circle 108px with a ~4px ring, connector sitting on the
circle's vertical centre, title cap `.20` of the diameter, and a `.44` diameter gap below
the circle. They are written against a single `--dia` custom property, so the whole marker
scales as one thing — `clamp(46px, 4.5vw, 66px)`.

The connector is a `.step::before` that starts at the circle's right edge and reaches
`-1 * var(--col-gap)` into the grid gap, so it meets the next circle. It is switched off on
the last column of each row (`:nth-child(3n)` at three-up, `:nth-child(2n)` at two-up, all
of them when stacked) — verified at eight widths that no row ends in a dangling line. The
circle carries an opaque `var(--bg)` fill so the line passes behind it rather than through.

Two things were dropped as part of this:

- The `Ogni progetto segue un processo preciso…` lead paragraph, as asked.
- The old single hairline with the scroll-driven red dot, and `updateProgress()` in
  `script.js` with it. The reference puts a connector in each row instead, and a master
  line above two rows of connectors read as clutter.
- The huge outlined `ÉLITE` wordmark behind the stage. It was fine behind one row of steps
  but ran straight through step 06's copy once there were two.

> **The six descriptions are mine.** Only the phase names were given, and the reference
> layout wants a line or two under each. Replace them whenever you have the real wording.

`--accent-lift: #c81730` was added for the numbers and rings. The house `#b11226` measures
2.90:1 on the black, just under the 3:1 floor for bold text at 19px; the lifted red is
3.51:1 and is not tellable apart at this size.

## Vehicle ticker

A full-bleed band between the services and `Come funziona?`, scrolling right to left:
SUV · Hatchback · Crossover · Pickup · Minivan · MPV · Sedan, white caps with red dots
between them, built from `Screenshot 2026-09-08 at 00.02.39.png`.

Proportions came off that crop rather than by eye — cap height 75px, dot 40px, 31px of gap
either side. That is a dot of `.53` cap and gaps of `.42` cap, which against Cabinet
Grotesk's `.670` cap ratio become `.378em` and `.3em`, so they hold at every size the
`clamp(30px, 5.1vw, 79px)` scale produces. Cabinet Grotesk Bold turned out to match the
reference face almost exactly in width: `CROSSOVER` measures 8.10 word-widths per cap
height against the reference's 8.21, so no tracking was needed.

The loop is two identical `.ticker__set` lists inside one track animated to
`translateX(-50%)`, which lands exactly on set two's start — measured seam offset is
0.000000px, so there is no jump.

The spacing after each dot rides on the `li` itself (`padding-right`), not on a `gap` on
the list. A list gap does not apply *between* the two lists, so the `Sedan → SUV` join was
22px tighter than every other one and that cramped join scrolled past once per cycle. All
thirteen joins now measure 22.03px. The second set is `aria-hidden`; the section carries the
label instead. Edges fade with a mask so words enter and leave rather than being chopped.

`prefers-reduced-motion: reduce` stops it dead. That rule needs `!important` because the
blanket reduced-motion block at the bottom of `styles.css` sets a `.001ms` duration on
everything and would otherwise win.

## Labels

Every small tracked label above a heading is gone: the hero's `Est. 2018 Milano Italia`,
all six section eyebrows, the `Shield` / `Optics` / `Molecular` card indices, the
`Step I — IV` markers above the process titles, and the `PPF` / `Lucidatura` tags above the
testimonials. The card subtitles went with the indices; the three services carry a title and
a description only.

`Recensioni` was the only thing naming that section, so it was promoted from an eyebrow to
a real `h2` rather than dropped.

Also gone: the `Progress 01 → 04 · 26%` readout above the timeline, and the Archivio's
right-hand meta column (`Project files · 2025–2026` and the blinking `Selecting_`). The
timeline keeps its travelling dot — `updateProgress()` in `script.js` now only moves the
dot, since the elements it used to write numbers into no longer exist.

Still there, and the closest remaining thing to what was removed: the `Full PPF` /
`Milano` mono lines under each project card, and the red `Full` badge on each image.

Earlier, all `//` and `/` separators and index numbers were stripped. Numbers that carry
meaning were left alone — the `12+ / 840 / 96h / 2Y` stats, the `PROGRESS 00 → 04` readout,
opening hours and the footer year.

## Still to drop in

- **Photography** — every `https://placehold.co/…` URL is a sized placeholder at the
  reference's real aspect ratio: 3 service-card backgrounds and 12 project cards. Project
  cards keep their natural aspect, so varied crops are fine.
- **Testimonials and project labels still describe the old business.** The four quotes talk
  about PPF, lucidatura, nanoceramico and ripristino pelle, and the Archivio cards are
  labelled `Full PPF`, `Wrapping`, `Nanoceramico` on Ferraris and Lamborghinis. None of
  those are services any more. Rewriting them means inventing new customer quotes and a new
  project list, so they were left as they are — say the word and I'll redo both.
- **Real contact details** — deliberately left as placeholders rather than carrying
  over the original business's: phone `+39 000 000 0000`, `info@elitecarstudio.it`,
  `Via —`, `P.IVA —`, and the "Realizzato da —" credit line.

## Notes

- Responsive from 390px up; no horizontal overflow at 390 / 768 / 915 / 1080 / 1470.
  The nav collapses to a burger below 800px, the services go from three-up to stacked
  below 900px, the CTA stacks below 1100px.
- The project carousel calls `preventDefault()` on `pointerdown` — without it the browser
  starts a native image drag, which fires `pointercancel` and kills the gesture after one
  move.
- All motion is behind `prefers-reduced-motion: reduce`.
- The testimonials grid holds 4 quotes. The reference capture is cut off partway
  through the second, so the row count past that is a guess.
