import os
from typing import Dict, Optional, List
import logging
from ..models.schemas import CategoryType

logger = logging.getLogger(__name__)

class SimpleAIService:
    """Simple rule-based AI service that doesn't require API keys"""
    
    def __init__(self):
        self.category_keywords = {
            CategoryType.FITNESS: ['workout', 'gym', 'fitness', 'exercise', 'yoga', 'training', 'health', 'muscle', 'cardio'],
            CategoryType.CODING: ['code', 'programming', 'developer', 'software', 'tech', 'python', 'javascript', 'coding'],
            CategoryType.FOOD: ['food', 'recipe', 'cooking', 'restaurant', 'delicious', 'meal', 'dinner', 'lunch', 'breakfast'],
            CategoryType.TRAVEL: ['travel', 'trip', 'vacation', 'destination', 'hotel', 'flight', 'beach', 'mountain', 'city'],
            CategoryType.DESIGN: ['design', 'art', 'creative', 'architecture', 'interior', 'graphic', 'style', 'aesthetic'],
            CategoryType.FASHION: ['fashion', 'style', 'outfit', 'clothing', 'dress', 'shirt', 'trend', 'wear'],
            CategoryType.BUSINESS: ['business', 'entrepreneur', 'startup', 'marketing', 'finance', 'money', 'investment'],
            CategoryType.EDUCATION: ['learn', 'tutorial', 'education', 'course', 'study', 'knowledge', 'skill', 'lesson'],
            CategoryType.ENTERTAINMENT: ['fun', 'entertainment', 'movie', 'music', 'game', 'funny', 'meme', 'video']
        }
    
    async def categorize_content(self, title: str, description: str, platform: str) -> CategoryType:
        """Categorize content using simple keyword matching"""
        text = f"{title} {description}".lower()
        
        # Score each category based on keyword matches
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            category_scores[category] = score
        
        # Return category with highest score, or OTHER if no matches
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            if category_scores[best_category] > 0:
                return best_category
        
        return CategoryType.OTHER

    async def summarize_content(self, title: str, description: str, platform: str) -> str:
        """Generate a simple summary"""
        text = f"{title} {description}".strip()
        
        # Simple truncation-based summary
        if len(text) <= 50:
            return text if text else f"Content from {platform}"
        else:
            return text[:47] + "..."

    async def extract_tags(self, title: str, description: str, category: str) -> List[str]:
        """Extract simple tags based on category and keywords"""
        tags = [category]
        
        text = f"{title} {description}".lower()
        
        # Add relevant keywords as tags
        if category in self.category_keywords:
            keywords = self.category_keywords[CategoryType(category)]
            for keyword in keywords[:3]:  # Limit to 3 additional tags
                if keyword in text and keyword not in tags:
                    tags.append(keyword)
        
        return tags[:5]  # Limit to 5 tags total

    def is_available(self) -> bool:
        """Simple AI service is always available"""
        return True
