# Competitor research

Before design and build, public websites of industrial blade manufacturers were studied for **structure, buyer workflow and weaknesses** — not for content. Captures were made on 2026-11-01 with the REA reverse-engineering toolkit (headless Chromium, accessibility-tree capture). Nothing from these sites — copy, images, logos, product data, prices, layouts or code — was copied into this project.

Full evidence log: `reverse engineer/docs/spec/shear-blade-manufacturer-site.md` in the analysis workspace.

## Sites

| Site | Type | Captured |
| --- | --- | --- |
| Baucor (baucor.com) | US/German industrial blade and CNC tool maker | Yes |
| L.A. Grinding (lagrinding.com) | US knife and shear-blade supplier with sharpening service | Yes |
| Apex Knives (apexknives.in) | Indian blade maker; shear blades for steel processing | Yes |
| American Cutting Edge | US machine-knife maker | No — the site serves a Cloudflare bot check to automated browsers; it was not bypassed |
| J.N. Arora | Named in the brief | No — no company website could be found (domain did not load; search found no match). Send the URL if you have it and it can be added. |

## What the industry does

1. **The quote is the conversion.** Every site repeats a quote call-to-action in the header, hero, mid-page and footer, and pairs it with "talk to an engineer/specialist".
2. **Two ways into the catalogue:** by blade type/shape and by industry or application.
3. **Made to drawing is the norm** for shear blades: products are shown as capabilities ("customised size", "as per drawing", "up to 14 ft") rather than fixed stock items.
4. **Product entries are a small spec table + paragraph + enquiry button.**
5. **Trust** comes from testimonials, machine-make compatibility lists, quality-standard badges and named locations with phone numbers.

## Where they fall short — and what this site does instead

| Weakness observed | This site |
| --- | --- |
| Enquiry forms are a single free-text box (name, phone, "describe your requirement") with no drawing upload. | Structured RFQ: blade list with quantities, machine, material and thickness, blade dimensions, edges, plus drawing upload (PDF/CAD/photos). Staff get everything needed to quote in one email. |
| No way to ask for several blades at once. | Quote list: add blades while browsing, send them together. |
| Spec tables filled with filler ("Hardness: Standard", "Finishing: Impeccable", "Precision: Perfect"). | No vague or invented numbers. Tables state real decision factors (edges, mounting, segmenting) and say plainly that grade and hardness are agreed per drawing. |
| Dead controls (`javascript:void(0)` links), 30+-dot auto carousels, duplicated headings. | Every control works (verified by end-to-end tests), no carousels, one h1 per page, WCAG 2.1 AA checked. |
| Generic stock imagery or none. | Each blade type has its own technical drawing, consistent with an engineering audience. Real photos can be added later. |
| Little buyer education. | Materials reference, "what decides blade life", regrinding FAQ and "what to send for a fast quote". |
| Directory-hosted sites with third-party branding and boilerplate. | Own design system, fast, accessible, secure. |
