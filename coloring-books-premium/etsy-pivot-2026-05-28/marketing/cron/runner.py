#!/usr/bin/env python3
"""
Post Scheduler Runner — PBI Creative Kids coloring books
Reads post-scheduler.json and posts to each platform if credentials are present.
If a platform's credentials are missing or its library is not installed,
the script prints what it would have posted and continues.
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

SCHEDULER_JSON = Path(__file__).parent / "post-scheduler.json"
STATE_FILE = Path(__file__).parent / ".posted-ids.json"

# ── helpers ────────────────────────────────────────────────────────────────────

def load_schedule():
    with open(SCHEDULER_JSON) as f:
        return json.load(f)

def load_posted():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return set(json.load(f))
    return set()

def save_posted(posted: set):
    with open(STATE_FILE, "w") as f:
        json.dump(list(posted), f, indent=2)

def due_now(post: dict) -> bool:
    post_time = datetime.fromisoformat(post["date_utc"].replace("Z", "+00:00"))
    return datetime.now(timezone.utc) >= post_time

def dry_run_print(post: dict, reason: str):
    print(f"\n[DRY-RUN] {reason}")
    print(f"  ID:       {post['id']}")
    print(f"  Platform: {post['platform']}")
    print(f"  Date UTC: {post['date_utc']}")
    print(f"  Asset:    {post['asset_path']}")
    print(f"  Copy:     {post['copy_text'][:120]}...")
    print(f"  URL:      {post['destination_url']}")

# ── Pinterest ───────────────────────────────────────────────────────────────────

def post_pinterest(post: dict):
    token = os.environ.get("PINTEREST_ACCESS_TOKEN")
    if not token:
        dry_run_print(post, "PINTEREST_ACCESS_TOKEN not set — skipping live post")
        return False

    try:
        import requests
    except ImportError:
        print("[ERROR] requests not installed. Run: pip install requests")
        dry_run_print(post, "requests library missing")
        return False

    board_id = os.environ.get("PINTEREST_BOARD_ID", "")
    if not board_id:
        dry_run_print(post, "PINTEREST_BOARD_ID not set — skipping live post")
        return False

    payload = {
        "board_id": board_id,
        "title": post.get("copy_text", "")[:60],
        "description": post.get("copy_text", ""),
        "link": post.get("destination_url", ""),
        "media_source": {
            "source_type": "image_url",
            "url": post.get("asset_path", "")
        }
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    try:
        resp = requests.post("https://api.pinterest.com/v5/pins", json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        print(f"[OK] Pinterest posted: {post['id']}")
        return True
    except Exception as e:
        print(f"[ERROR] Pinterest post failed for {post['id']}: {e}")
        return False

# ── Facebook ────────────────────────────────────────────────────────────────────

def post_facebook(post: dict):
    token = os.environ.get("FB_PAGE_TOKEN")
    page_id = os.environ.get("FB_PAGE_ID")
    if not token or not page_id:
        dry_run_print(post, "FB_PAGE_TOKEN or FB_PAGE_ID not set — skipping live post")
        return False

    try:
        import requests
    except ImportError:
        print("[ERROR] requests not installed. Run: pip install requests")
        dry_run_print(post, "requests library missing")
        return False

    message = post.get("copy_text", "")
    asset_path = post.get("asset_path", "")
    url = f"https://graph.facebook.com/v19.0/{page_id}/photos"

    try:
        with open(asset_path, "rb") as img_file:
            resp = requests.post(
                url,
                data={"message": message, "access_token": token},
                files={"source": img_file},
                timeout=30
            )
        resp.raise_for_status()
        print(f"[OK] Facebook posted: {post['id']}")
        return True
    except Exception as e:
        print(f"[ERROR] Facebook post failed for {post['id']}: {e}")
        return False

# ── Instagram (Graph API) ────────────────────────────────────────────────────────

def post_instagram(post: dict):
    ig_user_id = os.environ.get("IG_USER_ID")
    ig_token = os.environ.get("IG_ACCESS_TOKEN")
    if not ig_user_id or not ig_token:
        dry_run_print(post, "IG_USER_ID or IG_ACCESS_TOKEN not set — skipping live post")
        return False

    image_url = os.environ.get("IG_IMAGE_BASE_URL", "")
    if not image_url:
        dry_run_print(post, "IG_IMAGE_BASE_URL not set (public URL required for IG API) — skipping live post")
        return False

    try:
        import requests
    except ImportError:
        print("[ERROR] requests not installed. Run: pip install requests")
        dry_run_print(post, "requests library missing")
        return False

    caption = post.get("copy_text", "")
    asset_filename = Path(post.get("asset_path", "")).name
    full_image_url = f"{image_url.rstrip('/')}/{asset_filename}"

    try:
        # Step 1: Create media container
        container_resp = requests.post(
            f"https://graph.facebook.com/v19.0/{ig_user_id}/media",
            data={
                "image_url": full_image_url,
                "caption": caption,
                "access_token": ig_token
            },
            timeout=15
        )
        container_resp.raise_for_status()
        container_id = container_resp.json().get("id")

        # Step 2: Publish
        pub_resp = requests.post(
            f"https://graph.facebook.com/v19.0/{ig_user_id}/media_publish",
            data={"creation_id": container_id, "access_token": ig_token},
            timeout=15
        )
        pub_resp.raise_for_status()
        print(f"[OK] Instagram posted: {post['id']}")
        return True
    except Exception as e:
        print(f"[ERROR] Instagram post failed for {post['id']}: {e}")
        return False

# ── Twitter/X ───────────────────────────────────────────────────────────────────

def post_twitter(post: dict):
    bearer = os.environ.get("X_BEARER")
    api_key = os.environ.get("X_API_KEY")
    api_secret = os.environ.get("X_API_SECRET")
    access_token = os.environ.get("X_ACCESS_TOKEN")
    access_secret = os.environ.get("X_ACCESS_SECRET")

    if not all([bearer, api_key, api_secret, access_token, access_secret]):
        missing = [k for k, v in {
            "X_BEARER": bearer, "X_API_KEY": api_key, "X_API_SECRET": api_secret,
            "X_ACCESS_TOKEN": access_token, "X_ACCESS_SECRET": access_secret
        }.items() if not v]
        dry_run_print(post, f"Missing X env vars: {', '.join(missing)} — skipping live post")
        return False

    try:
        import tweepy
    except ImportError:
        print("[ERROR] tweepy not installed. Run: pip install tweepy")
        dry_run_print(post, "tweepy library missing")
        return False

    asset_path = post.get("asset_path", "")
    text = post.get("copy_text", "")[:280]

    try:
        client = tweepy.Client(
            bearer_token=bearer,
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_secret
        )
        auth = tweepy.OAuth1UserHandler(api_key, api_secret, access_token, access_secret)
        api_v1 = tweepy.API(auth)

        media = api_v1.media_upload(filename=asset_path)
        client.create_tweet(text=text, media_ids=[media.media_id])
        print(f"[OK] Twitter/X posted: {post['id']}")
        return True
    except Exception as e:
        print(f"[ERROR] Twitter/X post failed for {post['id']}: {e}")
        return False

# ── TikTok note ─────────────────────────────────────────────────────────────────

def note_tiktok(post: dict):
    print(f"\n[TIKTOK-MANUAL] TikTok has no public video-upload API.")
    print(f"  Upload manually via TikTok app or TikTok Creator Studio.")
    print(f"  Script: {post.get('copy_path','')}")
    print(f"  Section: {post.get('copy_section','')}")
    print(f"  Asset: {post.get('asset_path','')}")

# ── dispatch ────────────────────────────────────────────────────────────────────

PLATFORM_HANDLERS = {
    "pinterest": post_pinterest,
    "facebook": post_facebook,
    "instagram": post_instagram,
    "twitter": post_twitter,
    "tiktok": note_tiktok,
}

def main():
    schedule = load_schedule()
    posted = load_posted()
    posts = schedule.get("posts", [])
    newly_posted = set()

    print(f"\n=== PBI Creative Kids Post Runner — {datetime.now(timezone.utc).isoformat()} ===")
    print(f"Total scheduled: {len(posts)} | Already posted: {len(posted)}")

    for post in posts:
        pid = post["id"]
        if pid in posted:
            continue
        if not due_now(post):
            continue

        platform = post.get("platform", "").lower()
        handler = PLATFORM_HANDLERS.get(platform)
        if handler is None:
            print(f"[WARN] Unknown platform '{platform}' for post {pid} — skipping")
            continue

        print(f"\n→ Processing: {pid} ({platform}, {post['date_utc']})")
        success = handler(post)
        if success:
            newly_posted.add(pid)

    if newly_posted:
        posted.update(newly_posted)
        save_posted(posted)
        print(f"\n✓ {len(newly_posted)} post(s) sent. State saved to {STATE_FILE}")
    else:
        print("\n— No new posts due at this time.")

if __name__ == "__main__":
    main()
