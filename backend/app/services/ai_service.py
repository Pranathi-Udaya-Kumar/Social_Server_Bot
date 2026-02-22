from openai import OpenAI
import os
from typing import Dict, Optional, List
import logging
from ..models.schemas import CategoryType

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        if not self.client.api_key:
            logger.warning("OpenAI API key not found in environment variables")

    async def categorize_content(self, title: str, description: str, platform: str) -> CategoryType:
        """Categorize content using AI"""
        try:
            if not self.client.api_key:
                return CategoryType.OTHER

            prompt = f"""
            Analyze this social media content and categorize it into one of these categories:
            - fitness: workout routines, health tips, exercise
            - coding: programming, tech tutorials, development
            - food: recipes, cooking, restaurants
            - travel: destinations, travel tips, tourism
            - design: design tips, architecture, art
            - fashion: clothing, style, fashion trends
            - business: entrepreneurship, marketing, finance
            - education: learning, tutorials, academic content
            - entertainment: memes, videos, fun content
            - other: anything that doesn't fit above

            Title: {title}
            Description: {description}
            Platform: {platform}

            Respond with only the category name (lowercase):
            """

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a content categorization expert."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=10,
                temperature=0.3
            )

            category = response.choices[0].message.content.strip().lower()
            
            # Validate category
            try:
                return CategoryType(category)
            except ValueError:
                logger.warning(f"Invalid category returned by AI: {category}")
                return CategoryType.OTHER

        except Exception as e:
            logger.error(f"Error categorizing content: {e}")
            return CategoryType.OTHER

    async def summarize_content(self, title: str, description: str, platform: str) -> str:
        """Generate a 1-sentence summary of the content"""
        try:
            if not self.client.api_key:
                return f"Content from {platform}"

            prompt = f"""
            Create a concise, 1-sentence summary (max 15 words) of this social media content:
            
            Title: {title}
            Description: {description}
            Platform: {platform}
            
            Summary:
            """

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You create concise summaries of social media content."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=20,
                temperature=0.5
            )

            summary = response.choices[0].message.content.strip()
            
            # Clean up and limit length
            if len(summary) > 100:
                summary = summary[:97] + "..."
            
            return summary

        except Exception as e:
            logger.error(f"Error summarizing content: {e}")
            return f"Content from {platform}"

    async def extract_tags(self, title: str, description: str, category: str) -> List[str]:
        """Extract relevant tags from content"""
        try:
            if not self.client.api_key:
                return [category]

            prompt = f"""
            Extract 3-5 relevant tags from this content. Tags should be lowercase, single words, and relevant to the content.
            
            Title: {title}
            Description: {description}
            Category: {category}
            
            Respond with only the tags separated by commas (no numbers, no formatting):
            """

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You extract relevant tags from content."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=30,
                temperature=0.3
            )

            tags_text = response.choices[0].message.content.strip()
            tags = [tag.strip().lower() for tag in tags_text.split(',') if tag.strip()]
            
            # Ensure category is included
            if category not in tags:
                tags.insert(0, category)
            
            # Limit to 5 tags
            return tags[:5]

        except Exception as e:
            logger.error(f"Error extracting tags: {e}")
            return [category]

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return bool(self.client.api_key)
