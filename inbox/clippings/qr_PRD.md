---

# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## **QRForge — Dynamic QR Code Generator SaaS**

**Version:** 1.0 | **Date:** April 6, 2026 | **Author:** Product & Marketing Strategy Document

---

## 1. EXECUTIVE SUMMARY

QRForge is a full-featured QR code generator SaaS modeled directly after QR Tiger (qrcode-tiger.com), which has been operational since 2018, serves 850,000+ brands across 147 countries, and tracks 60 billion clicks yearly. This PRD covers every feature, page, flow, pricing tier, API, integration, and marketing strategy needed to build a competitive clone using exclusively free-tier infrastructure, developed with Claude Code.

The product generates both static (free, unlimited, no expiry) and dynamic (editable, trackable, subscription-gated) QR codes with deep customization (patterns, eyes, logos, colors, frames, templates), scan analytics, bulk generation, API access, and integrations with Zapier, HubSpot, Canva, Google Analytics, and Google Tag Manager.

---

## 2. COMPETITIVE INTELLIGENCE SUMMARY

**QR Tiger's key metrics observed from site analysis:**

Their pricing has four tiers: Free (3 dynamic QRs, 500 scans each), Regular ($7/mo monthly or annual, 12 dynamic QRs), Advanced ($16/mo billed annually, 200 dynamic QRs, marked "Most Popular"), and Premium ($37/mo billed annually, 600 dynamic QRs). They also have an Enterprise tier. They offer unlimited static QR codes on every plan including free. They support 30+ languages. Their blog has 84+ pages of SEO content. They produce eBooks, webinars, and a podcast ("Stay QRious"). They are ISO 27001 certified, GDPR/CCPA compliant, hosted on AWS, with 99.9% uptime. They integrate with Zapier, HubSpot, Canva, Google Analytics, Google Tag Manager, and Monday.com. Their QR code types span 20+ categories: URL, vCard, File, Link Page, Google Form, Menu, App Stores, Landing Page, Smart URL (Multi-URL), GS1 Digital, MP3, Video, WiFi, Email, Event, Facebook, YouTube, Instagram, Pinterest, TikTok, Twitter, Location, Text, SMS. Key advanced features include white-label custom domains, password protection, QR expiry, geofencing, geo-tracking, retargeting pixels, UTM builder, bulk generation (up to 3,000/batch), clone QR codes, editable QR design post-creation, and scan notifications. They have mobile apps on iOS and Android (generator + scanner). Social proof includes G2 (4.8 stars), Trustpilot (4.8 stars), SourceForge (5 stars), ProductHunt recognition, and press mentions from Forbes, Yahoo Finance, and Gulf News. They use Help Scout for customer support, reCAPTCHA for bot protection, and a newsletter plus discount popup for lead capture.

---

## 3. PRODUCT ARCHITECTURE

### 3.1 Free-Tier Tech Stack

**Frontend:** Next.js 14+ (Vercel free tier — 100GB bandwidth, serverless functions, edge network). Use App Router, React Server Components, and Tailwind CSS for the UI.

**Backend API:** Next.js API routes on Vercel serverless functions (free tier: 100GB-hours compute). For heavy operations like bulk QR generation, use Vercel Cron Jobs or offload to a Cloudflare Worker (free tier: 100K requests/day).

**Database:** Supabase free tier (500MB database, 1GB file storage, 50K monthly active users, 500K edge function invocations). PostgreSQL with Row Level Security for multi-tenant data isolation.

**Authentication:** Supabase Auth (free tier includes email/password, magic links, OAuth with Google/GitHub). Supports 50K MAU.

**File Storage:** Supabase Storage (1GB free) for uploaded logos, files, and generated QR code images. For overflow, use Cloudflare R2 (10GB free, zero egress fees).

**QR Code Generation Engine:** Open-source library `qrcode` (npm) for base generation + custom Canvas/SVG rendering pipeline for patterns, eyes, logos, colors, frames. All generation runs server-side via Node.js Canvas (`@napi-rs/canvas` or `sharp` for image processing).

**Analytics / Scan Tracking:** When a dynamic QR code is scanned, it hits a redirect endpoint. Log scan data (timestamp, IP → geo lookup via free MaxMind GeoLite2, user-agent → device parsing via `ua-parser-js`) into Supabase. Dashboard queries this data.

**Email:** Resend free tier (100 emails/day, 3K/month) for transactional emails, plan expiry reminders, and newsletter.

**Payments:** Stripe (no monthly fee, 2.9% + $0.30 per transaction). Stripe Checkout for subscriptions, Stripe Webhooks for plan management.

**CDN/Hosting:** Vercel Edge Network (built-in with free tier). Custom domain support included.

**DNS & Domain:** Cloudflare free tier for DNS management and DDoS protection.

**Monitoring:** Vercel Analytics (free tier), Sentry free tier for error tracking.

**Search/SEO:** Built-in Next.js static generation for blog pages, sitemaps, robots.txt. Use Vercel's ISR (Incremental Static Regeneration) for blog content.

### 3.2 System Architecture Diagram (Conceptual)

The architecture follows this flow: User Browser communicates with Vercel Edge (Next.js), which connects to Supabase (Auth, Database, Storage). QR Scan redirects hit a lightweight Vercel serverless function that logs analytics then redirects. Stripe handles payments via webhooks back to the API. The QR generation engine runs on serverless functions using Canvas/SVG rendering. The blog/SEO content is statically generated at build time.

---

## 4. FEATURE SPECIFICATIONS

### 4.1 QR Code Types (20+ Solutions)

Each QR code "type" is fundamentally a different input form that produces either a static or dynamic QR code. Here is every type to implement, with the exact data fields each requires:

**STATIC QR TYPES (free, no tracking, data encoded directly):**

URL — Input: URL string. WiFi — Inputs: SSID, password, encryption type (WPA/WEP/None), hidden network toggle. Email — Inputs: email address, subject, body. Text — Input: plain text string (up to 300 characters). SMS — Inputs: phone number, pre-filled message. Event — Inputs: event title, location, start date/time, end date/time (outputs iCal format). Location — Inputs: latitude, longitude (or address with geocoding). Facebook — Input: Facebook URL (profile, page, post, reel, event). YouTube — Input: YouTube URL (channel, video, shorts). Instagram — Input: Instagram URL (profile, post, reel). Pinterest — Input: Pinterest URL (profile, board, pin). TikTok — Input: TikTok URL (profile, video). Twitter/X — Input: Twitter URL (profile, tweet).

**DYNAMIC QR TYPES (paid, trackable, editable via short-URL redirect):**

URL (Dynamic) — Input: destination URL. Stores a short redirect URL in the QR; destination can be changed anytime. vCard (Digital Business Card) — Inputs: first name, last name, mobile, phone, fax, email, company, job title, street, city, state, zip, country, website, description, profile image upload, social media links (up to 10). Renders a beautiful digital business card landing page. Supports Add to Apple Wallet and Google Wallet. File — Input: file upload (PDF, JPEG, PNG, MP4, Excel, Word, PowerPoint). File size limits by plan (5MB Regular, 10MB Advanced, 20MB Premium). Link Page (Social Media Bio Link) — Inputs: title, description, profile image, up to 40+ social/business links with icons. Renders a branded bio-link landing page. Google Form — Input: Google Forms shareable URL. Menu — Input: PDF/image upload of restaurant menu, or structured menu builder. App Stores — Inputs: App Store URL, Google Play URL, AppGallery URL. Detects device OS and redirects to correct store. Landing Page (H5 Page) — No-code page builder. Inputs: HTML/CSS editor or drag-and-drop blocks (text, image, button, video, form). Smart URL (Multi-URL) — Inputs: multiple destination URLs with routing rules. Rules include: device language, scanner location (country/region), time of day (schedule), number of scans (first N scans go to URL A, rest to URL B), geofencing (lat/long radius). GS1 Digital Link — Inputs: GTIN, GCN, SSCC, GLN, GDTI, GSRN and other GS1 identifiers. Generates GS1-compliant QR codes. MP3/Audio — Input: audio file upload (MP3, WAV, up to 60MB). Renders an audio player landing page. Video — Input: video file upload (MP4) or video URL. Renders a video player landing page.

### 4.2 QR Code Customization Engine

This is the core differentiator and must be pixel-perfect. The customization panel has six tabs:

**Pattern:** 12+ pattern styles for the data modules (squares, rounded, dots, stars, diamonds, clover, horizontal lines, vertical lines, circles, rectangles, ovals, custom SVG). Implemented as SVG path generators that replace the standard square modules.

**Eyes (Finder Patterns):** Separate customization for outer eye frame (13 styles: square, rounded, circle, diamond, leaf, etc.) and inner eye dot (11 styles). Each eye can have its own color independent of the body.

**Logo:** Upload custom logo (JPEG, PNG, recommended 500KB-1MB, square format). Logo is centered in the QR code with automatic error correction level boost (Level H — 30% recovery). Logo area is cleared/masked in the QR matrix.

**Colors:** Single color for foreground, background color, gradient support (6 types: left-to-right linear, top-to-bottom, diagonal NW-SE, diagonal SW-NE, radial, and custom angle). Eye colors (outer frame color, inner dot color) can be set independently. Background can be transparent (for SVG).

**Frame:** 16+ frame templates that wrap around the QR code with call-to-action text (e.g., "Scan Me", "Scan to Order", custom text). Frame has its own color scheme.

**Templates:** Pre-designed complete QR code designs (pattern + eyes + colors + frame combinations). Users can save their own designs as templates and reuse them. Templates are stored per-account.

**Live Preview:** Real-time QR code preview that updates as the user changes customization options. Preview panel is sticky/fixed on the right side of the screen.

**Export Formats:** PNG (raster, configurable resolution) and SVG (vector, infinite scalability for print). Both available on all plans.

### 4.3 Dashboard & QR Code Management

**My QR Codes Dashboard:** Paginated list/grid view of all created QR codes. Sortable by: date created, name, category, total scans. Filterable by: QR type, folder, date range, status (active/expired). Search by QR name or campaign name. Each QR card shows: thumbnail, name, type, creation date, total scans, status badge.

**Folders:** Unlimited folders for organizing QR codes. Drag-and-drop QR codes into folders. Nested folder support optional (v2).

**QR Code Actions:** Edit destination/content (dynamic only). Edit QR design (pattern, colors, eyes, logo — Advanced+ plans). Clone/duplicate QR code. Delete (only if scanned fewer than 8 times). Download (PNG/SVG). View analytics/stats. Set password protection. Set expiry date/scan limit. Add UTM parameters. Enable/disable. Share direct link.

**Notifications:** Scan alert notifications (configurable: email notification when QR reaches N scans, or on every scan, or daily digest).

**Top 10 Watchlist:** Pin up to 10 QR campaigns to a watchlist for quick monitoring on the dashboard homepage.

### 4.4 Analytics & Tracking System

When a dynamic QR code is scanned, the flow is: Phone camera reads QR → browser opens short URL (e.g., `qr.yourapp.com/ABCDEF`) → serverless function logs all scan metadata → function responds with 302 redirect to actual destination URL.

**Data captured per scan:** Timestamp (with timezone). IP address (never stored permanently, only used to derive geo). Country, region, city (via MaxMind GeoLite2 free database). Device type (mobile/tablet/desktop). Operating system (iOS, Android, Windows, macOS, etc.). Browser. Referrer (if available). Unique vs. repeat scan (via fingerprinting or cookie). GPS coordinates (if precision geolocation enabled — user opt-in on scan).

**Analytics Dashboard views:** Scans over time (line chart, filterable by day/week/month/year/custom range). Unique vs. total scans. Top countries (bar chart). Top cities. Device OS breakdown (pie chart). Top 10 QR codes by scans. GPS heatmap (for precision geolocation). Map chart (country-level choropleth). Exportable reports (CSV).

**Retargeting Integration:** Facebook Pixel ID input — injected into the redirect landing page. Google Tag Manager container ID — injected into redirect pages. This allows users to build retargeting audiences from QR code scanners.

**UTM Builder:** Built-in UTM parameter generator for dynamic URL QR codes. Fields: utm_source, utm_medium, utm_campaign, utm_term, utm_content. Parameters are appended to the destination URL automatically. Editable after creation.

### 4.5 Bulk QR Code Generator

Available on Advanced and Premium plans. Users upload a CSV file (templates provided for download: Text QR, URL, URL with custom name, URL with campaign name, vCard). Maximum 3,000 rows per CSV batch. System generates individual QR codes for each row, all with the same customization design. Each bulk QR code is trackable if dynamic. Output: downloadable ZIP file containing all QR code images. Dashboard shows all bulk QR codes grouped by batch.

### 4.6 API

RESTful API with the following endpoints:

**QR Generation:** `POST /api/v1/qr/create` — Create a new QR code (static or dynamic). Accepts: type, content/data, customization parameters (pattern, eyes, colors, logo URL, frame, size). Returns: QR code image (base64 or URL), QR ID, short URL.

**QR Management:** `GET /api/v1/qr/{id}` — Get QR details. `PUT /api/v1/qr/{id}` — Update dynamic QR content. `DELETE /api/v1/qr/{id}` — Delete QR code.

**Analytics:** `GET /api/v1/data/{qrId}?period={period}&tz={timezone}` — Retrieve scan analytics. Periods: day (with epoch timestamp), daysAll, custom (with timestamp and endTimestamp), months, year.

**Bulk:** `POST /api/v1/qr/bulk` — Create QR codes in bulk from array of data.

**Rate limits by plan:** Regular: 500 requests/month. Advanced: 3,000 requests/month. Premium: 10,000 requests/month. Authentication via API key (found in account settings).

### 4.7 Integrations

**Zapier:** Build a Zapier app (published on Zapier's marketplace). Triggers: New QR code created, QR code scanned. Actions: Create URL QR code, Create vCard QR code, Create static QR code. Use Zapier's Developer Platform with the API.

**HubSpot:** HubSpot app marketplace listing. Send QR codes to contacts at scale. Custom CRM cards showing QR code data.

**Canva:** Canva Apps SDK integration. Users install the QRForge app inside Canva, generate QR codes, and drag them directly into designs.

**Google Analytics (GA4):** Measurement Protocol integration. Each scan event is sent to the user's GA4 property. Track from pageview to conversion.

**Google Tag Manager:** Users input their GTM container ID. The redirect landing pages include the GTM script, enabling all GTM-based tracking, retargeting, and bidding.

**Monday.com:** Monday.com app integration. Turn links into QR codes directly from Monday boards.

**Embeddable Widget:** Free static QR code generator popup widget that any website (WordPress, Shopify, static sites) can embed via a JavaScript snippet.

### 4.8 White Label / Custom Domain

Premium+ feature. Users point their subdomain (e.g., `qr.theirbrand.com`) via CNAME to QRForge's servers. All short URLs for that user's dynamic QR codes use their custom domain instead of the default. Implementation: Vercel supports custom domains per deployment; use a wildcard approach or programmatic domain addition via Vercel API. For the free-tier stack, handle this via Cloudflare Workers with custom hostname routing.

### 4.9 Geofencing

Premium+ feature. Users define a geographic boundary (center point lat/long + radius in km). QR code only resolves to the destination if the scanner is within the boundary. Outside the boundary, show a custom "not available in your area" page. Implementation: compare scanner's IP-derived geolocation against the defined fence.

### 4.10 Password Protection

Regular+ feature. Users set a password on a dynamic QR code. When scanned, instead of redirecting immediately, show a password input page. Correct password → redirect. Wrong password → error message.

### 4.11 QR Code Expiry

Regular+ feature. Two modes: Date-based expiry (QR code stops working after a specific date/time). Scan-count expiry (QR code stops working after N scans). After expiry, scanner sees a custom "this QR code has expired" page.

### 4.12 Mobile Apps (Phase 2)

iOS and Android apps using React Native or Expo (free). Features: QR code scanner (camera-based). QR code generator (same types as web). QR code management dashboard. Push notifications for scan alerts.

---

## 5. PAGE-BY-PAGE SPECIFICATION

### 5.1 Homepage (`/`)

**Hero Section:** Blue gradient background. Headline: clear value proposition about creating free QR codes. Two CTAs: primary "Create a FREE QR code" button (links to /register), secondary "Watch DEMO" button (opens video modal). Trust bar: "Trusted by more than 850,000 brands since 2018" with scrolling brand logos.

**QR Generator Tool (embedded on homepage):** This is the core product experience — the generator lives directly on the homepage, not behind a login wall. Top: horizontal scrollable tab bar with icons for each QR type (URL, vCard, File, Link Page, Google Form, Menu, App Stores, Landing Page, Smart URL, GS1 Digital, MP3, Video, WiFi, Email, Event, Facebook, YouTube, Instagram, Pinterest, TikTok, Twitter, Location, Text, SMS). Has "More/Less" toggle. Step 1 panel: shows input form for selected QR type. Static/Dynamic toggle radio buttons with tooltip explaining the difference. Step 2 panel: customization tabs (Pattern, Eyes, Logo, Colors, Frame, Templates). Right sidebar: live QR preview, save-as-template checkbox, PNG/SVG radio, Download button.

**"How it works" Section:** 3-step visual guide (Select type → Customize → Download).

**QR Code Carousel:** Scrollable carousel showing all QR types with thumbnails, names, descriptions, and "scan to try" actual QR codes.

**Security Section:** ISO 27001, AWS hosted, GDPR/CCPA compliance badges. Headline about security.

**Benefits Section:** Carousel with 4 cards (Fully Customizable, Scan Analytics, Cost-effective, Lifetime Valid QR Codes).

**Future-proof Technology Section:** 6 feature cards (Safe, GDPR/CCPA Compliant, Fast, Flexible, Reliable, Scalable) with specific metrics.

**Intelligent Scan Analytics Section:** Feature showcase with 3 tabs (Manage your QR codes, Learn from your scans, Smart tracking & retargeting).

**Press/Media Section:** Logos and quotes from publications.

**Review Badges:** G2, SourceForge, Trustpilot ratings.

**Testimonials Section:** Customer reviews carousel.

**Industry Use Cases Section:** Scrollable carousel (Tourism, Marketing, Real Estate, Retail, Education, Healthcare, Events, Logistics).

**Integrations Section:** Cards for Zapier, HubSpot, Canva, GA4, GTM, Monday.com.

**FAQ Section:** Accordion with 30+ questions organized into categories (The Basics, Account and Payment).

**Footer:** Newsletter signup, social media links, app store badges, resource links, guide links, support links, company links, terms links.

### 5.2 Pricing Page (`/pricing`)

Trust bar with brand logos at top. Toggle: "For Individuals" / "For Businesses". Billing toggle: Monthly / Yearly (with savings badge).

**Free Tier card:** "Free" label, "Try for free" subtitle, "No credit card required. Upgrade any time", "Sign up" CTA. Features: Unlimited static QR codes, 3 dynamic QR codes, 500 scans per dynamic QR code, basic scan analytics, unlimited file storage, basic support, QRForge logo popup on scan pages.

**Regular Tier card ($7/mo):** 12 dynamic QR codes, unlimited scans and downloads, advanced scan analytics, unlimited file storage, 24/7 support, ads-free, up to 5MB file upload, high-resolution images, API: 500 requests, unlimited folders, save templates, edit links, clone QR codes, App Store QR, vCard QR, Canva integration, 1 user, bulk QR codes, GA4 integration, Zapier/HubSpot integration, password protection, retargeting tool, scan notifications, QR expiry, custom UTM parameters, edit QR design, white label (custom domain), Smart Multi-URL QR codes, precision geolocation, geofencing.

**Advanced Tier card ($16/mo, "Most Popular" badge):** Everything in Regular plus: 200 dynamic QR codes, priority 24/7 support, up to 10MB file upload, API: 3,000 requests, bulk QR codes up to 3,000/batch.

**Premium Tier card ($37/mo):** Everything in Advanced plus: 600 dynamic QR codes, up to 20MB file upload, API: 10,000 requests, 1 white label domain.

**FAQ Section:** Pricing-specific questions.

### 5.3 Blog (`/blog`)

Full-featured blog with categories: Product Updates, Reports, Use Cases, Lists, Guides, QR Code News, Featured QRators (customer success stories). Paginated (12 articles per page, 84+ pages of content). Search functionality. Each article has: author, date, featured image, category badges. The blog is the primary SEO engine.

### 5.4 Individual QR Type Pages (`/qr-code-generator/[type]`)

Each of the 20+ QR types gets its own dedicated landing page with: the generator tool pre-set to that type, an SEO-optimized H1 heading, a detailed explanation of that QR type, use cases, step-by-step guide, FAQ specific to that type, internal links to related QR types and blog posts. These pages target long-tail keywords.

### 5.5 Solution/Industry Pages (`/qr-codes-in-[industry]`)

Dedicated landing pages for 10+ industries: Restaurants, Marketing, eCommerce, Education, Logistics, Events, Real Estate, Manufacturing, Healthcare, Travel/Tourism. Each page has: industry-specific use cases, relevant QR type recommendations, customer success stories, CTA to create QR codes.

### 5.6 Resources Hub (`/ebook`)

eBooks (gated behind email capture): QR Codes for Marketing, QR Codes for Retail, QR Codes for Education, QR Codes for Real Estate, QR Codes for Healthcare. Webinar recordings. Podcast episodes. These are lead generation magnets.

### 5.7 Additional Pages

`/compare-qr-code-generators` — Competitive comparison table (your product vs. competitors). `/faq` — Comprehensive FAQ (30+ questions, categorized). `/about` — Founder story, team, mission, vision, all QR solutions described. `/contact` — Contact form. `/help/[id]` — Help center articles. `/api-documentation` — Full API docs with code examples. `/integrations` — All integrations with descriptions and setup links. `/customer-success-stories` — Case studies. `/login`, `/register` — Auth pages. `/dashboard` — Protected dashboard. `/podcasts` — Video tutorials and podcast episodes. `/generate-bulk` — Bulk QR code generator tool.

### 5.8 Internationalization

Support 30+ languages using Next.js i18n routing (`/es/`, `/fr/`, `/de/`, `/ja/`, `/zh-cn/`, etc.). This is critical for SEO — QR Tiger ranks in dozens of languages. Use JSON translation files. Initially launch in English, then add languages progressively (high-priority: Spanish, French, German, Portuguese, Japanese, Chinese Simplified, Korean, Arabic).

---

## 6. DATABASE SCHEMA (Supabase/PostgreSQL)

**users** — id (uuid, PK), email, name, created_at, plan (enum: free/regular/advanced/premium/enterprise), plan_expires_at, stripe_customer_id, stripe_subscription_id, api_key (unique), white_label_domain, settings (jsonb).

**qr_codes** — id (uuid, PK), user_id (FK→users), short_code (unique, 6-8 chars), type (enum: url/vcard/file/link_page/google_form/menu/app_stores/landing_page/smart_url/gs1/mp3/video/wifi/email/event/facebook/youtube/instagram/pinterest/tiktok/twitter/location/text/sms), is_dynamic (boolean), content (jsonb — stores all type-specific data), design (jsonb — stores all customization data: pattern, eyes, colors, logo_url, frame, gradient), name, campaign_name, folder_id (FK→folders), password_hash (nullable), expires_at (nullable), max_scans (nullable), is_active (boolean), total_scans (integer, denormalized counter), created_at, updated_at.

**scans** — id (bigint, PK, auto-increment), qr_code_id (FK→qr_codes), scanned_at (timestamptz), country, region, city, latitude, longitude, device_type, os, browser, user_agent, ip_hash (hashed, for unique detection), is_unique (boolean). Index on (qr_code_id, scanned_at) for fast analytics queries.

**folders** — id (uuid, PK), user_id (FK→users), name, parent_folder_id (nullable, FK→folders), created_at.

**templates** — id (uuid, PK), user_id (FK→users), name, design (jsonb), created_at.

**bulk_jobs** — id (uuid, PK), user_id (FK→users), status (enum: pending/processing/completed/failed), csv_file_url, total_count, processed_count, design (jsonb), created_at, completed_at.

**blog_posts** — id (uuid, PK), slug (unique), title, content (text/markdown), excerpt, featured_image_url, author, category (text[]), tags (text[]), published_at, locale (text), seo_title, seo_description.

---

## 7. USER FLOWS

### 7.1 Free User Journey

User lands on homepage → sees QR generator tool → selects QR type (e.g., URL) → enters URL → sees "Static QR" is default → clicks "Generate QR code" → QR appears in preview → customizes pattern, eyes, colors → clicks Download → prompted to create free account → signs up (email/password or Google OAuth) → QR downloads as PNG → user sees dashboard with their QR code → upsell banner: "Unlock tracking and editing with Dynamic QR codes — Upgrade to Regular for $7/mo."

### 7.2 Paid User Journey (Dynamic QR)

User logs in → goes to dashboard → clicks "Create New QR" → selects type → enters data → selects "Dynamic QR" radio → customizes design → clicks Generate → QR is created with short URL → downloads → shares QR on printed materials → people scan → scans are logged → user checks dashboard analytics → sees scan chart, countries, devices → edits destination URL for a new campaign → same printed QR now goes to new URL.

### 7.3 Bulk Generation Flow

User on Advanced/Premium plan → navigates to /generate-bulk → downloads CSV template → fills in 500 URLs → uploads CSV → selects Static/Dynamic toggle → customizes design (shared for all QR codes) → clicks Generate → progress bar → download ZIP with 500 QR images → all appear in dashboard organized by batch.

---

## 8. PRICING & MONETIZATION MODEL

| Feature | Free | Regular ($7/mo) | Advanced ($16/mo) | Premium ($37/mo) |
|---|---|---|---|---|
| Static QR Codes | Unlimited | Unlimited | Unlimited | Unlimited |
| Dynamic QR Codes | 3 | 12 | 200 | 600 |
| Scans per Dynamic QR | 500 | Unlimited | Unlimited | Unlimited |
| File Upload Size | 5MB | 5MB | 10MB | 20MB |
| API Requests/Month | — | 500 | 3,000 | 10,000 |
| Bulk QR Generation | — | — | Up to 3,000/batch | Up to 3,000/batch |
| Analytics | Basic | Advanced | Advanced | Advanced |
| Integrations (Zapier, HubSpot, GA4) | — | ✓ | ✓ | ✓ |
| Password Protection | — | ✓ | ✓ | ✓ |
| Geofencing | — | ✓ | ✓ | ✓ |
| Retargeting (FB Pixel, GTM) | — | ✓ | ✓ | ✓ |
| White Label Domain | — | ✓ | ✓ | ✓ (1 domain) |
| Edit QR Design Post-Creation | — | ✓ | ✓ | ✓ |
| Support | Basic | 24/7 | Priority 24/7 | Priority 24/7 |
| Branding | QRForge popup | Ads-free | Ads-free | Ads-free + white label |
| Users per Account | 1 | 1 | 1 | 1 |
| Billing | — | Monthly or Annual | Annual Only | Annual Only |

**Revenue Projections (Year 1 targets):**

Month 1-3: Focus on free user acquisition (target 1,000 free users). Month 4-6: Conversion optimization (target 3% conversion → 30 paying users). Month 7-12: Scale content and ads (target 5,000 free users, 150 paying, ~$2,400/mo MRR). Year 1 ARR goal: ~$28,800.

**Payment Implementation:** Stripe Checkout for subscription creation. Stripe Billing Portal for self-service plan management. Stripe Webhooks for: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. Auto-renewal with opt-in (user adds payment method in Billing section). 2-day pre-expiry renewal window. Proration on plan upgrades. Discount coupons (for referrals and promotions).

---

## 9. MARKETING STRATEGY & TACTICS

### 9.1 SEO Strategy (Primary Growth Channel — $0 cost)

This is the #1 growth lever. QR Tiger has 84+ pages of blog content and ranks for thousands of keywords. Replicate this aggressively.

**Keyword Clusters to Target:**

*Head terms (high volume, high competition, long-term targets):* "QR code generator", "free QR code generator", "QR code maker", "create QR code", "QR code generator with logo", "dynamic QR code generator", "custom QR code."

*Long-tail terms (low competition, quick wins):* "[type] QR code generator" for every type (e.g., "vCard QR code generator", "WiFi QR code generator", "PDF to QR code", "Google Form QR code", "restaurant menu QR code", "app store QR code", "video QR code generator"). "[Industry] QR code" (e.g., "QR codes for real estate", "QR codes for education", "QR codes for healthcare"). "How to" guides (e.g., "how to create a QR code with logo", "how to track QR code scans", "how to make a dynamic QR code", "how to create a QR code for a PDF"). Comparison terms: "QR Tiger alternative", "QRCode Monkey vs QR Tiger", "best QR code generator 2026". Problem/solution terms: "QR code not working", "QR code not scanning", "QR code best practices."

**Content Calendar (first 90 days):** Publish 3-5 blog posts per week. Each post is 1,500-3,000 words, SEO-optimized with target keyword in H1, meta title, meta description, URL slug, first 100 words, and naturally throughout. Every blog post has a CTA to create a QR code. Internal linking strategy: every post links to 3-5 other posts and to relevant QR type pages.

**Programmatic SEO Pages:** Generate pages automatically for: every QR code type (`/qr-code-generator/[type]`), every industry (`/qr-codes-in-[industry]`), every language variant (`/[locale]/qr-code-generator/[type]`). This creates hundreds of indexable pages from day one.

**Technical SEO:** Server-side rendering (Next.js SSR/SSG) for all pages. Proper schema markup (Organization, Product, FAQ, HowTo, BreadcrumbList). XML sitemap generation (auto-updated). Robots.txt optimization. Canonical URLs for language variants. Core Web Vitals optimization (target all green). Open Graph and Twitter Card meta tags for social sharing. Hreflang tags for international pages.

### 9.2 Content Marketing

**Blog Categories & Content Types:**

"How To" Guides — Step-by-step tutorials for every QR code type and use case. Target keywords with "how to" intent. Use Cases — Industry-specific applications. "10 Ways to Use QR Codes in [Industry]" format. Lists — "Best [X] QR Code Generators" (include your own product, rank it #1). Comparison articles. Product Updates — Changelog, new feature announcements. Build authority and retain users. Reports/Statistics — "QR Code Statistics 2026", "QR Code Trends". Link-bait content that earns backlinks. Customer Success Stories ("QRators") — Case studies of real users. Social proof content. News — QR code industry news, government QR code implementations, brand QR code campaigns.

**Lead Magnets (Email Capture):** eBooks: "QR Codes for Marketing: The Complete Guide", "QR Codes for Retail", "QR Codes for Education", "QR Codes for Real Estate", "QR Codes for Healthcare." Gated behind email signup form. Deliver via automated Resend email. Webinar recordings and podcast episodes.

**Newsletter:** Weekly email to subscribers. Content: latest blog posts, QR code tips, product updates, promotional offers. Goal: nurture free users toward paid conversion and keep paying users engaged.

### 9.3 Social Media Strategy

**Platforms (in priority order):**

LinkedIn — Primary B2B platform. Share use cases, customer stories, industry insights. Target marketing managers, restaurant owners, real estate agents, event planners. Post 3-5x/week. YouTube — Tutorial videos: "How to Create a [Type] QR Code in 60 Seconds." Product demos. Industry use case videos. Podcast channel ("Stay Coded" or similar). Target: 2 videos/week. Instagram — Visual content: QR code design showcases, before/after QR customizations, infographics about QR code stats, Reels with quick tutorials. 5x/week. TikTok — Short-form video: "Did you know you can [use case] with a QR code?" format. Trending sound overlays. 3-5x/week. Twitter/X — Real-time engagement, QR code news, quick tips, thread content. Daily. Facebook — Community building, share blog posts, event-based content. 3x/week.

**Content Pillars:** Educational (how-to, tips, best practices) — 40%. Inspirational (customer stories, creative QR uses) — 25%. Product (feature showcases, new releases, demos) — 20%. Engagement (polls, questions, UGC) — 15%.

### 9.4 Product-Led Growth (PLG) Tactics

**Free Tier as Top-of-Funnel:** Unlimited static QR codes with no account required (generate on homepage). This creates massive top-of-funnel volume. Every downloaded QR code is a distribution channel — when someone scans a QR made with QRForge, the redirect page briefly shows "Powered by QRForge" with a link (on free tier). This is viral growth.

**Upgrade Triggers (built into the product):** When a free user tries to select "Dynamic QR" → show upgrade modal explaining benefits. When a free user tries to access analytics → show blurred analytics with upgrade CTA. When a free user reaches 3 dynamic QR limit → show "You've reached your limit" with plan comparison. When a free user tries bulk generation → show feature locked behind Advanced plan. On every free user's scan redirect page → show QRForge branding popup (removed on paid plans).

**Referral Program:** Every user gets a referral link. Referrer gets 1 free month added to their plan for every friend who signs up for a yearly plan. Friend gets $10 discount. Displayed prominently in account settings and post-purchase confirmation.

**Welcome Discount Popup:** On pricing page (first visit), show a popup: "Welcome Gift: Get $7 off any yearly plan. Use code WELCOME7." This creates urgency and captures impulse conversions.

### 9.5 Partnerships & Integrations as Distribution

**Canva App Marketplace:** Being listed on Canva's marketplace exposes the product to Canva's 150M+ monthly users. Each QR code generated via Canva is a potential paid conversion.

**Zapier App Directory:** Listing on Zapier's directory exposes the product to Zapier's 2M+ users. Focus on popular Zap templates: "Create QR code from new Shopify order", "Create QR code from new HubSpot contact."

**WordPress Plugin:** Build a free WordPress plugin that embeds the QR generator. Listed on wordpress.org plugin directory (free distribution to WP's 800M+ sites).

**Chrome Extension:** Free Chrome extension to generate QR codes for any URL. Listed on Chrome Web Store.

### 9.6 PR & Social Proof Strategy

**Review Platforms:** Actively request reviews on G2, Trustpilot, SourceForge, Capterra, GetApp. Trigger review request email 30 days after signup and after first 100 scans. Target: 4.5+ stars across all platforms.

**ProductHunt Launch:** Prepare a ProductHunt launch with: compelling tagline, demo video, founder story, early upvotes from community. Target: Top 5 Product of the Day.

**Press Outreach:** Pitch to: tech blogs (TechCrunch, Product Hunt Newsletter, BetaList), marketing publications (HubSpot Blog, Neil Patel, Social Media Examiner), industry publications (Restaurant Business, Real Estate Tech News). Angle: "Free QR code generator with enterprise features."

**Customer Success Stories:** Create a dedicated section. Interview 10 early customers. Format: challenge → solution (using QRForge) → results. Publish as blog posts and use in sales collateral.

### 9.7 Paid Acquisition (Phase 2, after revenue)

**Google Ads:** Target high-intent keywords: "QR code generator", "create QR code", "dynamic QR code". Start with $500/month budget. Optimize for signup conversions. Expected CPC: $1-3. Target CPA: $15-25.

**Facebook/Instagram Ads:** Retarget website visitors (people who used the free generator but didn't sign up). Lookalike audiences based on paying customers. Creative: video demos showing customization, carousel ads showing QR types.

**LinkedIn Ads:** Target by job title (Marketing Manager, Digital Marketing, Restaurant Owner, Real Estate Agent, Event Planner). Sponsored content: customer success stories and industry use case content.

9.8 Email Marketing Funnels
Funnel 1 — Free User Onboarding (7-email drip, via Resend):
Email 1 (Immediate): Welcome email + "Create your first QR code" CTA + link to quickstart guide. Email 2 (Day 2): "Did you know? Static vs Dynamic QR codes" — educate on the value of dynamic, plant the upgrade seed. Email 3 (Day 5): "5 creative ways to use QR codes for [their industry if known, or generic: marketing]" — value-add content. Email 4 (Day 8): "Your QR codes deserve tracking" — showcase analytics dashboard screenshot, CTA to try a dynamic QR. Email 5 (Day 14): "You have 3 free dynamic QR codes — have you tried them?" — usage-based nudge. Email 6 (Day 21): Customer success story — social proof from a similar user. Email 7 (Day 30): "Exclusive: 20% off your first year" — time-limited discount code with urgency.
Funnel 2 — Trial-to-Paid Conversion (for users who created dynamic QRs):
Triggered when a free user creates their first dynamic QR code. Email 1 (Immediate): "Your dynamic QR is live! Here's how to track scans." Email 2 (After 10 scans): "Your QR code just hit 10 scans! Unlock unlimited scans with Regular." Email 3 (At 400/500 scans): "You're approaching your scan limit (400/500). Upgrade now to keep your QR active."
Funnel 3 — Churn Prevention (for paying users):
Email 1 (30 days before expiry): "Your plan renews in 30 days — here's what you've achieved" with stats recap. Email 2 (7 days before expiry): "Don't lose your [X] dynamic QR codes — renew now." Email 3 (2 days before expiry): "Final reminder: renew today to keep your QR codes active." Email 4 (Day of expiry): "Your plan has expired. Your QR codes are paused. Renew now to reactivate."
Funnel 4 — Lead Magnet / eBook Download:
User downloads an eBook → Email 1 (immediate): deliver the eBook PDF. Email 2 (Day 3): "Hope you enjoyed [eBook Title] — here are 3 related blog posts." Email 3 (Day 7): "Ready to put it into practice? Create your first QR code for free." Merges into Funnel 1 afterward.
9.9 Community & Retention Strategy
Help Center: Self-service knowledge base with 50+ articles organized by topic (Getting Started, QR Code Types, Customization, Analytics, Billing, API, Integrations, Troubleshooting). Built as static pages in Next.js for SEO. Searchable.
In-App Chat: Integrate a free live chat widget (Crisp free tier: 2 seats, or Tawk.to: unlimited free). Respond within 1 hour during business hours.
Podcast / Video Series: Launch a "Stay Coded" (or similar) podcast/YouTube series covering QR code marketing tips, industry interviews, and product updates. Bi-weekly episodes. Purpose: authority building, SEO (YouTube is the #2 search engine), and customer retention.
Changelog / Product Updates Page: Public changelog at /changelog. Every new feature gets a blog post + email to users + in-app notification badge. Keep paying users feeling like they're getting ongoing value.
9.10 Conversion Rate Optimization (CRO) Tactics
Homepage CRO: The QR generator is directly on the homepage — no friction. This is the single most important design decision. Users can generate and download a static QR without ever signing up. Signup is required only when they want dynamic features, to save their QR, or to access the dashboard. Exit-intent popup on homepage: "Wait! Get 3 free dynamic QR codes — sign up now."
Pricing Page CRO: Default to annual billing (higher LTV). "Most Popular" badge on the Advanced plan to anchor mid-tier pricing. Show savings percentage for annual vs monthly. Trust badges (security certifications, review scores). Welcome discount popup on first visit (coupon code). FAQ section directly below plans to handle objections.
Dashboard CRO: Empty state for new users: guided first-QR creation wizard. Progress indicators: "You've used 1 of 3 dynamic QR codes." Feature teaser cards: show blurred previews of locked features with "Upgrade to unlock" CTAs.

10. SECURITY & COMPLIANCE
Authentication: Email/password with bcrypt hashing. OAuth (Google, GitHub) via Supabase Auth. Optional two-factor authentication (TOTP via authenticator app). Session management with JWT tokens (short-lived access tokens + refresh tokens).
Data Protection: All data encrypted at rest (Supabase/PostgreSQL default encryption). All data encrypted in transit (HTTPS everywhere, enforced via Vercel and Cloudflare). Scanner IP addresses are hashed before storage (never store raw IPs). Personal data anonymization options for GDPR compliance. Data retention policy: deleted accounts have data purged after 30 days; expired plans retain data for 1 year maximum.
GDPR Compliance: Cookie consent banner (decline by default). Data export (users can download all their data). Right to erasure (users can request account deletion). Privacy policy page. Data Processing Agreement (DPA) available on request. No unauthorized third-party data sharing.
CCPA Compliance: "Do Not Sell My Personal Information" link. Opt-out mechanisms for data collection.
Rate Limiting: API endpoints rate-limited by plan tier. Global rate limiting on QR generation to prevent abuse (e.g., 100 QR codes per hour per IP for unauthenticated requests). reCAPTCHA v3 on generation form to prevent bot abuse.
Content Policy: Terms of Acceptable Use prohibiting: malware distribution via QR codes, phishing, spam, illegal content. Automated scanning of destination URLs against Google Safe Browsing API. Ability to disable/suspend QR codes that violate terms.

11. ANALYTICS & METRICS (Internal Business Metrics)
North Star Metric: Monthly Active QR Creators (users who create at least 1 QR code per month).
Acquisition Metrics: Website visitors (by source: organic, direct, referral, social, paid). Signup rate (visitors → registered users). Cost per acquisition (when running paid ads).
Activation Metrics: Time to first QR code creation. % of signups who create a QR within 24 hours. % of signups who create a dynamic QR (indicates upgrade potential).
Revenue Metrics: MRR (monthly recurring revenue). ARR (annual recurring revenue). ARPU (average revenue per user). LTV (lifetime value). CAC (customer acquisition cost). LTV:CAC ratio (target: >3:1).
Retention Metrics: DAU/MAU ratio. Churn rate (monthly and annual). Plan renewal rate. Feature adoption rates (which QR types are most used, which customization options).
Engagement Metrics: QR codes created per user per month. Scans per QR code (average). Dashboard visits per user per week. API usage per user.
Implement via: Vercel Analytics (page views, Web Vitals). PostHog free tier (product analytics, funnels, cohorts — 1M events/month free). Stripe Dashboard (revenue metrics).

12. DEVELOPMENT ROADMAP
Phase 1 — MVP (Weeks 1–6)
Core QR generation engine (static: URL, Text, WiFi, Email, SMS, Location, Event + all social media types). Basic customization (3 patterns, 3 eye styles, logo upload, single color, background color). PNG/SVG export. Homepage with embedded generator. User auth (email/password + Google OAuth). Basic dashboard (list QR codes, delete). Dynamic QR for URL type (short URL redirect + scan logging). Basic analytics (total scans, scans over time chart). Pricing page (UI only, Stripe integration). Stripe payments (Regular plan only). Blog with 20 seed articles. SEO fundamentals (meta tags, sitemap, SSR).
Phase 2 — Feature Parity (Weeks 7–12)
All 20+ QR types (vCard, File, Link Page, Google Form, Menu, App Stores, Landing Page, Smart URL, GS1, MP3, Video). Full customization engine (all 12 patterns, all 13 outer eyes, all 11 inner eyes, gradients, 16 frames, templates). Advanced analytics (geo, device, OS, unique scans, heatmap). Folders and QR management. Password protection, QR expiry, scan limits. UTM builder. Clone QR code. Edit QR design post-creation. All pricing tiers active (Regular, Advanced, Premium). Bulk QR generator. API (v1). Email funnels (onboarding, conversion, churn prevention).
Phase 3 — Growth & Integrations (Weeks 13–20)
Zapier integration. HubSpot integration. Canva integration. Google Analytics (GA4) integration. Google Tag Manager integration. White label / custom domain. Geofencing. Retargeting (FB Pixel, GTM injection). Internationalization (top 5 languages). eBooks and lead magnets. Help center (50 articles). Referral program. WordPress plugin. Chrome extension. ProductHunt launch.
Phase 4 — Scale (Weeks 21–30)
Mobile apps (React Native/Expo — iOS + Android). All 30+ languages. AI-powered QR design suggestions. Advanced landing page builder (drag-and-drop). Enterprise tier (multi-user, SSO, custom contracts). Podcast launch. Paid ads (Google, Facebook, LinkedIn). Scale to 20+ blog posts per week. A/B testing on pricing and homepage.

13. TECHNICAL IMPLEMENTATION NOTES FOR CLAUDE CODE
QR Code Generation Library: Use qrcode npm package for the base QR matrix generation. Set error correction to Level H (30%) when a logo is present, Level M (15%) otherwise. The base library gives you a binary matrix (array of arrays of booleans). You then render this matrix yourself using HTML Canvas (@napi-rs/canvas on the server) or SVG generation, applying custom patterns, eye styles, colors, gradients, and frames programmatically.
Pattern Rendering: Each "pattern" style is a function that takes (x, y, moduleSize, isActive) and returns an SVG path or Canvas drawing command. For example: "dots" pattern renders circles instead of squares; "rounded" renders rounded rectangles; "star" renders star shapes at each active module position.
Eye Rendering: The three 7×7 finder patterns (top-left, top-right, bottom-left) need to be rendered separately from the data modules. Each eye has an outer frame (7×7 with hollow center) and inner dot (3×3). Detect these positions in the matrix and render them with their own styles and colors.
Logo Placement: After rendering the QR code, clear a centered rectangular area (typically 20-25% of QR width) and draw the uploaded logo image in that space. The high error correction level (H) ensures the QR remains scannable despite the missing modules.
Dynamic QR Short URL System: Generate a unique 6-8 character alphanumeric code (base62 encoding of a counter or random generation with collision check). Store in qr_codes.short_code. The QR code image encodes https://qr.yourdomain.com/{shortCode}. The redirect endpoint at /api/redirect/[shortCode] does a DB lookup, logs the scan, and returns a 302 redirect. This endpoint must be extremely fast (target <100ms) — use edge functions if possible.
File Handling for File QR Type: When a user uploads a file (PDF, image, video, audio), store it in Supabase Storage (or Cloudflare R2). The dynamic QR points to a landing page (/view/[shortCode]) that displays the file in an appropriate viewer (PDF.js for PDFs, native <video> for MP4, native <audio> for MP3, <img> for images).
vCard Landing Page: When a vCard QR is scanned, render a beautiful digital business card page with the contact's photo, name, title, company, all contact details, social links, and a prominent "Save Contact" button that triggers a .vcf file download.
Smart URL (Multi-URL) Logic: The redirect endpoint for Smart URL QR codes evaluates routing rules in order: (1) Check scanner's detected language against language rules. (2) Check scanner's geolocation against location rules. (3) Check current time against time-based rules. (4) Check total scan count against scan-count rules. (5) Check geofencing radius. First matching rule wins; if no rules match, use the default URL.
Scan Analytics Aggregation: For performance, don't query raw scans for every dashboard view. Run a Supabase scheduled function (or Vercel Cron) nightly to aggregate daily scan counts per QR code into a scan_daily_stats table (qr_code_id, date, total_scans, unique_scans, top_country, top_device). Dashboard queries this aggregated table for charts. Real-time data comes from a simple COUNT query on the scans table for the current day.

14. SUCCESS CRITERIA & KPIs
Month 1: Site live with MVP features. 20 blog posts published. 500 website visitors. 50 registered users. 200 static QR codes generated.
Month 3: 50+ blog posts. 5,000 monthly visitors. 500 registered users. 15 paying users. $105-$240/mo MRR. 5,000 QR codes generated total.
Month 6: 150+ blog posts. 25,000 monthly visitors. 2,000 registered users. 60 paying users. $700-$1,500/mo MRR. Featured on ProductHunt. 25,000 QR codes generated total.
Month 12: 300+ blog posts. 100,000 monthly visitors. 8,000 registered users. 250 paying users. $3,000-$6,000/mo MRR. Top 20 Google ranking for "free QR code generator." Zapier and Canva integrations live. 100,000+ QR codes generated total.

That's the complete PRD — sections 9.8 through 14. Combined with the first part, you have a full spec covering every feature, page, database table, user flow, pricing tier, API endpoint, integration, marketing funnel, development phase, and success metric. You can hand this entire document to Claude Code and start building Phase 1 immediately.