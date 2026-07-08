# Site Audit & Fix Report — 2026-07-08

Full-site technical SEO, on-page and frontend overhaul for キーボードテスト.com
(`xn--nckya1bjc7izjb.com`).

## What was good (kept)

- Solid topical cluster: 112 Japanese guides interlinked with the tool pages.
- Real, working test tools existed (keyboard, mouse, mic, speaker, typing)
  with sensible vanilla-JS implementations.
- Correct `lang="ja"`, robots.txt, Google Search Console verification file,
  and structured-data foundation (Organization / WebSite / BreadcrumbList).
- Rich, unique long-form Japanese content on the English-named tool pages.

## What was broken (why it wasn't ranking)

1. **Two parallel duplicate trees competing for the same keywords.**
   The sitemap and all 112 guides pointed at the Japanese-named pages
   (`キーボードテスト.html` …), but those pages had **no functional tools** —
   just a fake "テストツール" box with "テストを開始してください". The pages
   with the actual tools (`keyboard-test.html` …) were orphaned: not in the
   sitemap, not internally linked, and duplicated the same content/keywords.
   Google indexed doorway-style pages with no tool (terrible engagement
   signals) while the real tools were invisible.
2. **Broken viewport meta on every English tool page** — the tag contained
   the page description instead of `width=device-width…`, failing
   mobile-friendliness on the only pages that had tools.
3. **The speed test was fake** — it displayed random numbers
   (`70 + Math.random() * 150`) labelled as measurements.
4. **The site-search page had no search** — no input, no script — while the
   sitewide `SearchAction` schema advertised `?q=` search on it.
5. **Most of the site was unstyled** — the Japanese-named pages used CSS
   classes (`site-header`, `breadcrumbs`, `result`, `updated`) that did not
   exist in styles.css.
6. **Every TOC on ~118 pages linked to `href="#"`** (dead anchors).
7. Homepage canonical pointed at `/index.html` instead of `/`; breadcrumb
   schema had a duplicate self-referencing item.
8. Identical FAQPage schema duplicated across dozens of URLs (spam pattern);
   `SoftwareApplication` schema on pages with no application.
9. Visible junk text ("SEO Content Section", "Detailed SEO Article Section")
   from malformed comments on tool pages; `twitter:title` of
   "キーボードテスト | キーボードテスト"; og:title containing the description;
   conflicting fake author metadata ("Ava Garcia").
10. Render-blocking Google Fonts import of Latin-only fonts (Inter/Lexend)
    on a Japanese site; no favicon; no og:image; footer linking users to the
    XML sitemap.

## What was changed

- **Merged the real tools into the canonical Japanese pages.** The six
  Japanese tool pages now contain the functional tool UI + the rich article
  content, working TOCs, unique FAQs (visible text = FAQPage schema), and
  `WebApplication` structured data. All related-guide links point into
  `ガイド/`.
- **English duplicates canonicalized** to their Japanese equivalents
  (tools, guides, about/authors/contact/policy pages) and their nav/footer
  now link into the canonical tree. Broken viewports, og/twitter titles and
  junk text fixed.
- **Homepage rebuilt as a hub**: hero, six tool cards, popular guides,
  unique FAQ, canonical `https://…/`, root-relative internal home links.
- **Real speed test**: measures ping/download/upload against
  speed.cloudflare.com with streaming progress and an honest error state —
  no simulated numbers.
- **Working client-side site search** on サイト内検索.html (static index of
  all 127 canonical pages, supports `?q=` deep links, matching the
  SearchAction schema).
- **styles.css rewritten**: system font stack (no external fonts), styles
  for every page template, responsive nav/status bars/keyboard (horizontal
  scroll on mobile), focus states, reduced-motion support, guide-card lists,
  FAQ styling.
- **Sitewide script fixes on 145 files**: unified header/footer with logo +
  aria labels, fixed all TOC anchors, percent-encoded canonicals/og:url/
  JSON-LD URLs (IDN-safe), favicon + theme-color + og:image everywhere,
  dateModified bumped, boilerplate FAQPage schema removed from non-topical
  pages, fake author meta removed.
- **sitemap.xml regenerated**: 127 canonical URLs (root `/` + Japanese tree),
  fresh lastmod; duplicates excluded. Typing test gained Japanese romaji
  practice sentences.
- Verified: 5,946 internal links and all TOC anchors resolve; JSON-LD parses
  on every page; tools exercised end-to-end in headless Chromium
  (see QA workflow results in the PR/commit description).

## Remaining recommendations

- Consider serving 301 redirects from the English-named URLs to the Japanese
  canonicals at the hosting layer (canonical tags are in place, but 301s are
  stronger).
- Replace the templated guide FAQs with genuinely page-specific questions
  over time, and consolidate near-duplicate guides (e.g. 入力遅延 vs
  入力遅延を減らす) as content is refreshed.
- Add a real 1200×630 PNG og:image for social sharing (currently the SVG
  logo is used).
- Submit the new sitemap in Search Console and request re-crawl of the six
  tool pages and the homepage.
