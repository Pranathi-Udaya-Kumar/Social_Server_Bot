from fastapi import APIRouter, Request, Form
from fastapi.responses import Response
from twilio.twiml.messaging_response import MessagingResponse
from sqlalchemy.orm import Session
import re
import requests
import os
import logging
from typing import Optional

from ..models.database import get_db
from ..models.schemas import PlatformType, ContentCreate, CategoryType
from ..services.content_service import ContentService
from ..services.gemini_service import GeminiService
from ..services.simple_ai_service import SimpleAIService

router = APIRouter()
logger = logging.getLogger(__name__)

gemini_service = GeminiService()
simple_service = SimpleAIService()

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
}

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def normalize_phone(phone: str) -> str:
    return phone.replace("whatsapp:", "").strip()

def extract_url_and_category(message: str) -> tuple[Optional[str], Optional[str]]:
    """
    Extract URL and optional category override from message.
    Supports: <url> #fitness  or  #coding <url>  in any order.
    """
    url_match = re.search(r'https?://[^\s]+', message)
    url = url_match.group(0) if url_match else None

    category_match = re.search(
        r'#(fitness|coding|food|travel|design|fashion|business|education|entertainment)',
        message.lower()
    )
    category = category_match.group(1) if category_match else None

    return url, category

def get_platform(url: str) -> str:
    u = url.lower()
    if 'instagram.com' in u:                    return 'instagram'
    if 'youtube.com' in u or 'youtu.be' in u:   return 'youtube'
    if 'twitter.com' in u or 'x.com' in u:      return 'twitter'
    if 'facebook.com' in u or 'fb.watch' in u:  return 'facebook'
    return 'other'

def platform_to_enum(platform: str) -> PlatformType:
    return {
        'instagram': PlatformType.INSTAGRAM,
        'youtube':   PlatformType.YOUTUBE,
        'twitter':   PlatformType.TWITTER,
    }.get(platform, PlatformType.OTHER)

# ─── CONTENT EXTRACTION ───────────────────────────────────────────────────────

def fetch_youtube(url: str) -> Optional[dict]:
    """YouTube oEmbed — FREE, no API key. Returns real video title."""
    try:
        resp = requests.get(
            f"https://www.youtube.com/oembed?url={url}&format=json",
            headers=HEADERS, timeout=10
        )
        if resp.status_code == 200:
            data   = resp.json()
            title  = data.get('title', '')
            author = data.get('author_name', '')
            logger.info(f"YouTube fetched: '{title}' by {author}")
            return {
                'title':         title,
                'description':   f'YouTube video by {author}' if author else 'YouTube video',
                'thumbnail_url': data.get('thumbnail_url'),
                'hashtags':      [],
            }
    except Exception as e:
        logger.warning(f"YouTube oEmbed failed: {e}")
    return None


def fetch_instagram_apify(url: str) -> Optional[dict]:
    """
    Fetch real Instagram caption + hashtags using Apify's Instagram Scraper.
    Actor: apify/instagram-scraper
    Free plan: ~2,000 results/month at no cost.
    Setup: sign up at apify.com → copy API token → add APIFY_API_TOKEN to .env

    Returns full caption (not just title), hashtag list, and thumbnail URL.
    """
    api_token = os.getenv("APIFY_API_TOKEN")
    if not api_token:
        logger.warning("APIFY_API_TOKEN not set — skipping Apify Instagram fetch")
        return None

    try:
        endpoint = (
            "https://api.apify.com/v2/acts/apify~instagram-scraper"
            f"/run-sync-get-dataset-items?token={api_token}&timeout=30"
        )
        payload = {
            "directUrls":   [url],
            "resultsType":  "posts",
            "resultsLimit": 1,
        }

        resp = requests.post(endpoint, json=payload, timeout=35)
        logger.info(f"Apify status: {resp.status_code}")

        if resp.status_code != 200:
            logger.warning(f"Apify returned {resp.status_code}: {resp.text[:200]}")
            return None

        items = resp.json()
        if not items or not isinstance(items, list):
            logger.warning("Apify returned empty dataset")
            return None

        post      = items[0]
        caption   = post.get('caption') or post.get('alt') or ''
        hashtags  = post.get('hashtags') or []   # list of tag strings without #
        thumbnail = (
            post.get('displayUrl') or
            post.get('thumbnailUrl') or
            post.get('previewUrl')
        )

        lines      = [l.strip() for l in caption.split('\n') if l.strip()]
        first_line = lines[0][:250] if lines else ''

        logger.info(f"Apify caption: '{first_line[:80]}'")
        return {
            'title':         first_line or 'Instagram Content',
            'description':   caption[:600],
            'thumbnail_url': thumbnail,
            'hashtags':      hashtags,
        }

    except Exception as e:
        logger.warning(f"Apify Instagram fetch failed: {e}")
    return None


def fetch_instagram_oembed(url: str) -> Optional[dict]:
    """Instagram oEmbed fallback — returns title only, may 401 without auth."""
    try:
        resp = requests.get(
            f"https://www.instagram.com/oembed?url={url}",
            headers=HEADERS, timeout=10
        )
        if resp.status_code == 200:
            data  = resp.json()
            title = data.get('title', '')
            if title:
                logger.info(f"Instagram oEmbed: '{title}'")
                return {
                    'title':         title,
                    'description':   '',
                    'thumbnail_url': data.get('thumbnail_url'),
                    'hashtags':      [],
                }
    except Exception as e:
        logger.warning(f"Instagram oEmbed failed: {e}")
    return None


def fetch_instagram(url: str) -> Optional[dict]:
    """
    Instagram extraction chain:
    1. Apify scraper  → full caption + hashtags (best, needs APIFY_API_TOKEN)
    2. oEmbed         → title only (partial fallback)
    3. None           → Gemini will infer from URL structure
    Jina/generic scraping is skipped — Instagram login wall blocks them.
    """
    result = fetch_instagram_apify(url)
    if result and result.get('title') and result['title'] != 'Instagram Content':
        return result

    result = fetch_instagram_oembed(url)
    if result and result.get('title'):
        return result

    return None


def fetch_via_jina(url: str) -> Optional[dict]:
    """
    Jina AI Reader — 100% FREE, no API key.
    Great for Twitter/X, articles, blogs. Skipped for Instagram.
    """
    try:
        resp = requests.get(
            f"https://r.jina.ai/{url}",
            headers={**HEADERS, 'Accept': 'text/plain'},
            timeout=15
        )
        if resp.status_code == 200:
            text = resp.text.strip()
            if len(text) > 50:
                lines = [l.strip() for l in text.split('\n') if l.strip()]
                title = lines[0][:200] if lines else ''
                desc  = ' '.join(lines[1:4])[:400] if len(lines) > 1 else ''
                logger.info(f"Jina extracted: '{title[:80]}'")
                return {
                    'title':         title,
                    'description':   desc,
                    'thumbnail_url': None,
                    'hashtags':      [],
                }
    except Exception as e:
        logger.warning(f"Jina fetch failed: {e}")
    return None


def fetch_generic(url: str) -> Optional[dict]:
    """Last resort: scrape og:title / og:description meta tags."""
    try:
        from bs4 import BeautifulSoup
        resp = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
        if resp.status_code != 200:
            return None
        bs    = BeautifulSoup(resp.text, 'html.parser')
        title = bs.find('meta', property='og:title')
        desc  = bs.find('meta', property='og:description')
        img   = bs.find('meta', property='og:image')
        t = title.get('content', '').strip() if title else ''
        d = desc.get('content', '').strip()  if desc  else ''
        i = img.get('content', '')           if img   else ''
        if t:
            return {'title': t, 'description': d, 'thumbnail_url': i or None, 'hashtags': []}
    except Exception as e:
        logger.warning(f"Generic scrape failed: {e}")
    return None


def scrape(url: str, platform: str) -> Optional[dict]:
    """
    Extraction chain per platform:
      Instagram  → Apify (captions) → oEmbed → None (Gemini infers from URL)
      YouTube    → oEmbed → Jina → generic
      Twitter/X  → Jina → generic
      Other      → Jina → generic
    """
    if platform == 'youtube':
        result = fetch_youtube(url)
        if result and result.get('title'):
            return result

    elif platform == 'instagram':
        # Jina and generic scraping blocked by Instagram login wall — skip them
        return fetch_instagram(url)

    # Twitter, blogs, articles
    result = fetch_via_jina(url)
    if result and result.get('title'):
        return result

    return fetch_generic(url)


# ─── MAIN PROCESSING ──────────────────────────────────────────────────────────

async def process_link(
    url: str,
    user_phone: str,
    db: Session,
    category_override: Optional[str] = None
) -> str:
    try:
        platform      = get_platform(url)
        platform_enum = platform_to_enum(platform)

        # ── Step 1: Scrape real content ────────────────────────────────────────
        scraped       = scrape(url, platform)
        scraped_title = scraped.get('title', '')       if scraped else ''
        scraped_desc  = scraped.get('description', '') if scraped else ''
        thumbnail     = scraped.get('thumbnail_url')   if scraped else None
        hashtags      = scraped.get('hashtags', [])    if scraped else []

        # Append scraped hashtags into description for richer AI context
        if hashtags:
            hashtag_str  = ' '.join(f'#{h}' for h in hashtags[:10])
            scraped_desc = f'{scraped_desc} {hashtag_str}'.strip()

        logger.info(f"Scraped: '{scraped_title}' | Override: {category_override} | Platform: {platform}")

        # ── Step 2: AI analysis ────────────────────────────────────────────────
        if gemini_service.is_available():
            ai_result = await gemini_service.analyze_url(
                url=url,
                platform=platform,
                scraped_title=scraped_title,
                scraped_desc=scraped_desc,
            )
            title       = ai_result.get('title') or scraped_title or f'{platform.title()} Content'
            description = ai_result.get('description') or scraped_desc or ''
            ai_summary  = ai_result.get('ai_summary', f'Content from {platform}')
            tags        = ai_result.get('tags', [])
            try:
                ai_category = CategoryType(ai_result.get('category', 'other'))
            except ValueError:
                ai_category = CategoryType.OTHER
            method = "Gemini AI"
        else:
            title       = scraped_title or f'{platform.title()} Content'
            description = scraped_desc or ''
            ai_category = await simple_service.categorize_content(title, description, platform)
            ai_summary  = await simple_service.summarize_content(title, description, platform)
            tags        = await simple_service.extract_tags(title, description, ai_category.value)
            method = "Keyword match"

        # ── Step 3: Apply user's #hashtag category override if provided ────────
        if category_override:
            try:
                category = CategoryType(category_override)
                if category_override not in tags:
                    tags.insert(0, category_override)
                method = f"{method} + manual #{category_override}"
            except ValueError:
                category = ai_category
        else:
            category = ai_category

        # ── Step 4: Save to database ───────────────────────────────────────────
        content_create = ContentCreate(
            url=url,
            platform=platform_enum,
            title=title,
            description=description,
            category=category,
            tags=tags,
            ai_summary=ai_summary,
            media_url=None,
            thumbnail_url=thumbnail,
            user_phone=user_phone,
        )
        ContentService(db).create_content(content_create)

        emoji_map = {
            'fitness': '[Fitness]', 'coding': '[Coding]', 'food': '[Food]', 'travel': '[Travel]',
            'design': '[Design]', 'fashion': '[Fashion]', 'business': '[Business]',
            'education': '[Education]', 'entertainment': '[Entertainment]', 'other': '[Other]'
        }
        emoji         = emoji_map.get(category.value, '📌')
        override_note = f" _(you tagged #{category_override})_" if category_override else ""

        return (
            f"[OK] Saved to *{category.value.title()}* {emoji}{override_note}\n\n"
            f"[Info] {ai_summary}\n\n"
            f"[{method}] • {platform.title()}_\n\n"
            f"View: http://localhost:3000"
        )

    except Exception as e:
        logger.error(f"process_link error: {e}", exc_info=True)
        return "❌ Something went wrong saving your link. Please try again."


# ─── WEBHOOK ──────────────────────────────────────────────────────────────────

@router.post("/whatsapp")
async def whatsapp_webhook(
    request: Request,
    From: str = Form(...),
    To: str = Form(...),
    Body: str = Form(...),
    MessageSid: str = Form(...)
):
    try:
        db         = next(get_db())
        user_phone = normalize_phone(From)
        url, category_override = extract_url_and_category(Body)

        if not url:
            resp = MessagingResponse()
            resp.message(
                "👋 *Social Saver*\n\n"
                "Send me any link to save it:\n"
                "• 📸 Instagram posts & reels\n"
                "• 🎥 YouTube videos\n"
                "• 🐦 Twitter/X posts\n"
                "• 🔗 Any article or webpage\n\n"
                "💡 *Tip:* Add a hashtag to force a category:\n"
                "  `https://instagram.com/... #fitness`\n"
                "  `https://youtube.com/... #coding`\n\n"
                "Supported: #fitness #coding #food #travel\n"
                "#design #fashion #business #education #entertainment"
            )
            return Response(content=str(resp), media_type="application/xml")

        reply = await process_link(url, user_phone, db, category_override)
        resp  = MessagingResponse()
        resp.message(reply)
        return Response(content=str(resp), media_type="application/xml")

    except Exception as e:
        logger.error(f"Webhook error: {e}", exc_info=True)
        resp = MessagingResponse()
        resp.message("❌ Something went wrong. Please try again.")
        return Response(content=str(resp), media_type="application/xml")


@router.get("/whatsapp")
async def whatsapp_verify():
    return {"status": "WhatsApp webhook active"}