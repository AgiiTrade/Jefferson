# Marketing Kit — PBI Creative Kids Coloring Books

10 printable coloring books. All assets exist. Everything below is ready to deploy.

---

## What's in this kit

| Folder | Contents | Count |
|---|---|---|
| `pinterest/` | 5 pin specs per book (JSON) | 50 pins |
| `tiktok/` | 3 hook scripts per book (MD) | 30 scripts |
| `etsy-seo/` | Refreshed titles, descriptions, 13 tags per book (CSV + notes) | 10 listings |
| `social/` | IG carousel + FB post + 3 X posts per book + 4-week rotation calendar | 50 posts + calendar |
| `email/` | 3-email past-buyer nurture sequence + lead magnet spec | 2 files |
| `cron/` | post-scheduler.json, runner.py, install-cron.sh, README | 4 files |

---

## What is auto-postable TODAY (with env credentials)

Set the credentials listed in `cron/README.md` and run:

```bash
cd cron/
./install-cron.sh   # wires runner.py to crontab, fires every 30 min
python3 runner.py   # run immediately to test
```

| Platform | Auto-postable? | What you need |
|---|---|---|
| **Pinterest** | Yes | `PINTEREST_ACCESS_TOKEN` + `PINTEREST_BOARD_ID` |
| **Facebook Page** | Yes | `FB_PAGE_TOKEN` + `FB_PAGE_ID` |
| **Instagram Business** | Yes | `IG_USER_ID` + `IG_ACCESS_TOKEN` + `IG_IMAGE_BASE_URL` (public image host) |
| **Twitter/X** | Yes (if on paid X Dev tier) | 5 X env vars — see `cron/README.md` |

**Note for Instagram:** The Graph API requires images to be hosted at a public URL.
You'll need to upload the `individual-products/*/listing-images/*.jpg` files to S3,
Cloudflare R2, or another public host first. Set `IG_IMAGE_BASE_URL` to the base path.

---

## What requires your browser session (manual)

| Task | Why manual | Where to find the content |
|---|---|---|
| **TikTok video upload** | No public TikTok posting API exists | `tiktok/<slug>.md` — full scripts with HOOK, BEATS, CTA |
| **Etsy listing SEO update** | Etsy API requires separate OAuth setup (not wired here) | `etsy-seo/etsy-listings-refreshed.csv` — copy/paste new title + description + tags per listing |
| **Pinterest (no app token)** | Requires a Pinterest app with OAuth | Pin specs in `pinterest/<slug>.json` — schedule manually via Pinterest's built-in scheduler |
| **IG_IMAGE_BASE_URL setup** | One-time: upload images to a public host | `individual-products/*/listing-images/*.jpg` |

---

## Priority order (start here)

1. **Etsy SEO first** — update the 10 listings using `etsy-seo/etsy-listings-refreshed.csv`. This improves organic Etsy search immediately with zero ad spend. Takes ~30–45 minutes manually.

2. **Pinterest** — 50 pins scheduled. Even without the API, schedule 5 pins manually per day via Pinterest's scheduler. Pinterest has long content shelf life; a pinned post from month 1 still drives traffic in month 6.

3. **IG/FB automation** — set credentials, run `install-cron.sh`, done. 12 posts are scheduled for the next 28 days across the rotation calendar.

4. **TikTok** — highest effort but highest ceiling. One viral dino or unicorn video can drive hundreds of Etsy clicks. Use the scripts in `tiktok/`. Film a 15-second phone video showing the printed pages and recite the HOOK as on-screen text.

5. **Email list** — set up the lead magnet using `email/lead-magnet.md` (spec only — you need to create the 5-page sampler PDF from existing assets). Load the `email/past-buyers-sequence.md` emails into Mailchimp/ConvertKit. Takes 2–3 hours.

---

## ETSY_URL placeholders

Every copy file and the scheduler JSON use `ETSY_URL_<SLUG_UPPER>` placeholders.
Before going live, do a global find-and-replace:

| Placeholder | Replace with |
|---|---|
| `ETSY_URL_DINOSAUR_ADVENTURES` | Your actual Etsy listing URL |
| `ETSY_URL_CUTE_PUPPIES_KITTENS` | Your actual Etsy listing URL |
| `ETSY_URL_ABC_ANIMAL_ALPHABET` | Your actual Etsy listing URL |
| `ETSY_URL_BUGS_BUTTERFLIES` | Your actual Etsy listing URL |
| `ETSY_URL_COOL_TRUCKS_CARS` | Your actual Etsy listing URL |
| `ETSY_URL_FARM_ANIMALS` | Your actual Etsy listing URL |
| `ETSY_URL_MAGICAL_UNICORNS` | Your actual Etsy listing URL |
| `ETSY_URL_PRINCESS_CASTLE` | Your actual Etsy listing URL |
| `ETSY_URL_SPACE_ADVENTURES` | Your actual Etsy listing URL |
| `ETSY_URL_UNDER_THE_SEA` | Your actual Etsy listing URL |
| `ETSY_SHOP_URL` | Your Etsy shop home URL |

---

## File map

```
marketing/
├── README.md                          ← you are here
├── pinterest/
│   ├── abc-animal-alphabet.json
│   ├── bugs-butterflies.json
│   ├── cool-trucks-cars.json
│   ├── cute-puppies-kittens.json
│   ├── dinosaur-adventures.json
│   ├── farm-animals.json
│   ├── magical-unicorns.json
│   ├── princess-castle.json
│   ├── space-adventures.json
│   └── under-the-sea.json
├── tiktok/
│   ├── abc-animal-alphabet.md
│   ├── bugs-butterflies.md
│   ├── cool-trucks-cars.md
│   ├── cute-puppies-kittens.md
│   ├── dinosaur-adventures.md
│   ├── farm-animals.md
│   ├── magical-unicorns.md
│   ├── princess-castle.md
│   ├── space-adventures.md
│   └── under-the-sea.md
├── etsy-seo/
│   ├── etsy-listings-refreshed.csv
│   └── etsy-listings-refreshed.md
├── social/
│   ├── launch-week.md
│   └── rotation-4week.md
├── email/
│   ├── past-buyers-sequence.md
│   └── lead-magnet.md
└── cron/
    ├── post-scheduler.json
    ├── runner.py
    ├── install-cron.sh
    └── README.md
```
