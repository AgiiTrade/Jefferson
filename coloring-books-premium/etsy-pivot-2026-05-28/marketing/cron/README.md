# Cron Automation — PBI Creative Kids Marketing Runner

## What this does

`runner.py` reads `post-scheduler.json` and posts to each platform when a post's
`date_utc` has passed. It keeps state in `.posted-ids.json` so posts fire exactly
once. `install-cron.sh` wires runner.py to crontab at a 30-minute polling interval.

---

## Quick start

```bash
# 1. Set your credentials (see env vars below)
# 2. Install the cron
chmod +x install-cron.sh
./install-cron.sh

# 3. Test manually
python3 runner.py
```

---

## Required env vars per platform

### Pinterest
| Variable | Where to get it |
|---|---|
| `PINTEREST_ACCESS_TOKEN` | Pinterest Developer → App → Access Token (OAuth2) |
| `PINTEREST_BOARD_ID` | From Pinterest board URL or API |

**Library required:** `pip install requests`

**Notes:** The Pinterest v5 API posts image pins from a URL or uploaded media.
The runner submits via `POST /v5/pins` with the asset path converted to a direct
URL if `IG_IMAGE_BASE_URL` is set, otherwise it uses the local file path
(Pinterest API requires a publicly accessible URL — host your images on S3/Cloudflare
or use a temporary public URL service).

---

### Facebook (Page)
| Variable | Where to get it |
|---|---|
| `FB_PAGE_TOKEN` | Meta for Developers → Your App → Tools → Graph API Explorer → Page Access Token |
| `FB_PAGE_ID` | Facebook Page → About → Page ID |

**Library required:** `pip install requests`

**Notes:** Posts to a Facebook Page (not personal profile). Token must have
`pages_manage_posts` and `pages_read_engagement` permissions. Long-lived page
tokens do not expire — use those for cron automation.

---

### Instagram (Business via Graph API)
| Variable | Where to get it |
|---|---|
| `IG_USER_ID` | Graph API Explorer → `me/accounts` → find your IG Business account |
| `IG_ACCESS_TOKEN` | Same page token as Facebook (IG Business + FB Page are linked) |
| `IG_IMAGE_BASE_URL` | Public base URL where your listing images are hosted (e.g. `https://your-s3-bucket.s3.amazonaws.com/coloring-books/`) |

**Library required:** `pip install requests`

**Notes:** Instagram Graph API requires a **publicly accessible image URL** —
it cannot read local file paths. You must upload the listing images to a public
host (S3, Cloudflare R2, GitHub Pages with LFS, etc.) and set `IG_IMAGE_BASE_URL`
to the base directory. The runner constructs the full URL as `{IG_IMAGE_BASE_URL}/{filename}`.

**Account requirement:** Instagram Business or Creator account linked to a Facebook Page.
Personal Instagram accounts cannot use the Graph API.

---

### Twitter / X
| Variable | Where to get it |
|---|---|
| `X_BEARER` | X Developer Portal → App → Keys and tokens → Bearer Token |
| `X_API_KEY` | X Developer Portal → App → Keys and tokens → API Key |
| `X_API_SECRET` | X Developer Portal → App → Keys and tokens → API Key Secret |
| `X_ACCESS_TOKEN` | X Developer Portal → App → Keys and tokens → Access Token (for your own account) |
| `X_ACCESS_SECRET` | X Developer Portal → App → Keys and tokens → Access Token Secret |

**Library required:** `pip install tweepy`

**Notes:** Requires X Developer account with at least "Basic" tier access ($100/mo) for
media upload + posting. Free tier read-only. If cost is a concern, post X content manually
using the scripts in `marketing/tiktok/` and `marketing/social/launch-week.md`.

---

## TikTok — MANUAL UPLOAD REQUIRED

**TikTok has no public API for video/image upload by third parties.**

TikTok's Content Posting API is restricted to approved partners only and requires
manual app review. As of 2026, there is no self-serve programmatic posting option.

**What to do instead:**
1. Open TikTok app on your phone or TikTok Creator Studio in your browser
2. Use the scripts in `marketing/tiktok/<slug>.md` for each book
3. Upload the cover image or mockup image as a photo slideshow or over-b-roll video
4. Paste the HOOK as on-screen text and the CTA as the caption

Recommended posting cadence: 3–5 TikTok posts per week, rotating books.

---

## Etsy listing updates — MANUAL (unless Etsy API wired)

The refreshed titles, descriptions, and tags are in `marketing/etsy-seo/etsy-listings-refreshed.csv`.
Etsy does have an API (`/v3/application/listings/{listing_id}`) that can be called
with an OAuth token to update listing details. This runner does NOT handle Etsy updates.
Apply the CSV changes manually via Etsy Seller Hub → Listings → Edit, or wire the
Etsy API separately.

---

## What posts automatically (with credentials)

| Platform | Auto? | Credential needed |
|---|---|---|
| Pinterest | Yes | PINTEREST_ACCESS_TOKEN + PINTEREST_BOARD_ID |
| Facebook | Yes | FB_PAGE_TOKEN + FB_PAGE_ID |
| Instagram | Yes | IG_USER_ID + IG_ACCESS_TOKEN + IG_IMAGE_BASE_URL |
| Twitter/X | Yes (paid tier) | X_BEARER + X_API_KEY + X_API_SECRET + X_ACCESS_TOKEN + X_ACCESS_SECRET |
| TikTok | No — manual | Browser session in TikTok app |
| Etsy SEO | No — manual | Etsy Seller Hub |

## State file

`.posted-ids.json` — JSON array of post IDs already dispatched. Delete this file
to reset state and re-run all posts (useful for testing). Never delete in production
unless you intend to re-post.

## Logs

`runner.log` — stdout + stderr from each cron execution. Tail it with:
```bash
tail -f runner.log
```
