import google.generativeai as genai
import os
from typing import Dict, Optional, List
import logging
import json
from ..models.schemas import CategoryType

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Uses Google Gemini to intelligently analyze social media URLs.

    Key insight: instead of scraping Instagram (which always fails),
    we pass URL directly to Gemini. Gemini's training knowledge
    knows what Instagram Reels, YouTube videos etc. typically contain.
    Falls back to keyword matching if no API key.
    """

    def __init__(self):
        self.model = None
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set — falling back to keyword matching")
            return
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Gemini AI initialized successfully")
        except Exception as e:
            logger.error(f"Gemini init failed: {e}")

    def is_available(self) -> bool:
        return self.model is not None

    async def analyze_url(self, url: str, platform: str, scraped_title: str = "", scraped_desc: str = "") -> Dict:
        """
        MAIN METHOD: Analyzes a URL using Gemini AI.
        Works even when scraping fails — Gemini infers from URL structure
        and its own knowledge of what content exists on each platform.
        Returns: title, description, category, ai_summary, tags
        """
        if not self.model:
            return self._keyword_fallback(url, platform, scraped_title, scraped_desc)

        # Build context — use scraped data only if it's actually useful
        context_parts = [f"URL: {url}", f"Platform: {platform}"]
        if scraped_title and scraped_title not in ("Instagram Content", "YouTube Content", ""):
            context_parts.append(f"Scraped title: {scraped_title}")
        if scraped_desc and "Saved from" not in scraped_desc:
            context_parts.append(f"Scraped description: {scraped_desc[:300]}")

        prompt = f"""You are analyzing a saved social media link. Based on URL and context, return a JSON profile.

{chr(10).join(context_parts)}

Even if you cannot access the URL, infer from:
- The platform type (Instagram/YouTube/Twitter/Facebook)
- Any keywords, hashtags or readable words in URL path
- Common content patterns on that platform

IMPORTANT: Never return generic titles like "Instagram Post" or "YouTube Video".
Be specific about what this content likely covers based on any clues in the URL.

Respond ONLY with valid JSON (no markdown, no code blocks):
{{
  "title": "Specific descriptive title inferred from URL and platform",
  "description": "2-3 sentences about what this content likely covers",
  "category": "exactly one of: fitness, coding, food, travel, design, fashion, business, education, entertainment, other",
  "ai_summary": "One punchy sentence about value of this content",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}}"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Strip markdown if Gemini wraps in code blocks
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            data = json.loads(text)

            # Validate and clean category
            raw_cat = data.get("category", "other").lower().strip()
            valid_cats = ["fitness","coding","food","travel","design","fashion","business","education","entertainment","other"]
            category = raw_cat if raw_cat in valid_cats else "other"

            tags = [t.lower().strip() for t in data.get("tags", []) if t.strip()][:5]
            if category not in tags:
                tags.insert(0, category)

            return {
                "title":       data.get("title") or f"Content from {platform}",
                "description": data.get("description") or "",
                "category":    category,
                "ai_summary":  data.get("ai_summary") or f"Saved {platform} content",
                "tags":        tags,
            }

        except Exception as e:
            logger.error(f"Gemini analyze_url failed: {e} — using fallback")
            return self._keyword_fallback(url, platform, scraped_title, scraped_desc)

    def _keyword_fallback(self, url: str, platform: str, title: str = "", desc: str = "") -> Dict:
        """Keyword-based fallback when Gemini unavailable"""
        import re

        text = f"{title} {desc} {url}".lower()

        # Try to extract readable words from URL itself
        if not title or title in ("Instagram Content", "YouTube Content", ""):
            words = re.findall(r'[a-zA-Z]{4,}', url)
            skip = {'https','http','www','instagram','youtube','twitter','facebook',
                    'reel','watch','post','status','com','net','org'}
            meaningful = [w for w in words if w.lower() not in skip]
            title = " ".join(meaningful[:5]).title() if meaningful else f"Content from {platform}"

        categories = {
            "fitness":       ['workout','gym','fitness','exercise','yoga','training','health','cardio','muscle'],
            "coding":        ['code','programming','developer','software','tech','python','javascript','coding','tutorial'],
            "food":          ['food','recipe','cooking','restaurant','meal','dinner','lunch','breakfast','chef'],
            "travel":        ['travel','trip','vacation','destination','hotel','beach','mountain','city','tour'],
            "design":        ['design','art','creative','architecture','graphic','aesthetic','ui','ux'],
            "fashion":       ['fashion','style','outfit','clothing','dress','trend','wear','ootd'],
            "business":      ['business','entrepreneur','startup','marketing','finance','money','invest'],
            "education":     ['learn','tutorial','education','course','study','knowledge','skill','lesson'],
            "entertainment": ['fun','entertainment','movie','music','game','funny','meme','comedy'],
        }

        best, best_score = "other", 0
        for cat, keywords in categories.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > best_score:
                best, best_score = cat, score

        return {
            "title":       title,
            "description": desc or f"Saved from {platform}",
            "category":    best,
            "ai_summary":  f"{title[:60]} — saved from {platform}",
            "tags":        [best, platform],
        }

    # ── Legacy compatibility methods ─────────────────────────────────────────
    async def categorize_content(self, title: str, description: str, platform: str) -> CategoryType:
        result = await self.analyze_url("", platform, title, description)
        try:
            return CategoryType(result["category"])
        except ValueError:
            return CategoryType.OTHER

    async def summarize_content(self, title: str, description: str, platform: str) -> str:
        result = await self.analyze_url("", platform, title, description)
        return result["ai_summary"]

    async def extract_tags(self, title: str, description: str, category: str) -> List[str]:
        result = await self.analyze_url("", category, title, description)
        return result["tags"]
