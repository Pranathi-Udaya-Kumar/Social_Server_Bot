import requests
import re
from typing import Dict, Optional
from bs4 import BeautifulSoup
import logging
from urllib.parse import urlparse, parse_qs

logger = logging.getLogger(__name__)

class InstagramService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def extract_content(self, url: str) -> Optional[Dict]:
        """Extract content from Instagram URL - Enhanced for Reels and captions"""
        try:
            # Normalize URL
            normalized_url = self._normalize_url(url)
            if not normalized_url:
                return None
            
            # Extract shortcode from URL
            shortcode = self._extract_shortcode(normalized_url)
            if not shortcode:
                return None
            
            # Try oEmbed first (best for public posts)
            content_data = self._extract_with_oembed(normalized_url)
            
            if not content_data:
                # Fallback to enhanced scraping
                content_data = self._basic_extraction(normalized_url)
            
            return content_data
            
        except Exception as e:
            logger.error(f"Error extracting Instagram content from {url}: {e}")
            return None

    def _normalize_url(self, url: str) -> Optional[str]:
        """Normalize Instagram URL"""
        url = url.strip()
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Convert to regular format
        url = url.replace('www.instagram.com', 'instagram.com')
        
        # Validate domain
        if 'instagram.com' not in url:
            return None
            
        return url

    def _extract_shortcode(self, url: str) -> Optional[str]:
        """Extract shortcode from Instagram URL"""
        patterns = [
            r'instagram\.com/p/([^/?]+)',
            r'instagram\.com/reel/([^/?]+)',
            r'instagram\.com/tv/([^/?]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    def _extract_with_oembed(self, url: str) -> Optional[Dict]:
        """Try to extract using Instagram oEmbed endpoint"""
        try:
            oembed_url = f"https://www.instagram.com/oembed?url={url}"
            response = self.session.get(oembed_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'title': data.get('title', ''),
                    'description': '',  # oEmbed doesn't provide description
                    'author': data.get('author_name', ''),
                    'thumbnail_url': data.get('thumbnail_url', ''),
                    'html': data.get('html', ''),
                    'width': data.get('width', 0),
                    'height': data.get('height', 0),
                    'hashtags': self._extract_hashtags(data.get('title', '')),
                    'caption': data.get('title', '')
                }
        except Exception as e:
            logger.warning(f"oEmbed extraction failed: {e}")
        
        return None

    def _basic_extraction(self, url: str) -> Optional[Dict]:
        """Enhanced HTML scraping as fallback"""
        try:
            response = self.session.get(url, timeout=10)
            
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract basic meta tags
            title = soup.find('meta', property='og:title')
            description = soup.find('meta', property='og:description')
            image = soup.find('meta', property='og:image')
            
            # Extract caption from meta property or title
            caption = title.get('content', '') if title else ''
            
            # Extract hashtags from meta description or page text
            hashtags = []
            if description:
                hashtags.extend(self._extract_hashtags(description.get('content', '')))
            
            # Also try to find hashtags in page text
            page_text = soup.get_text()
            hashtags.extend(self._extract_hashtags(page_text))
            
            return {
                'title': title.get('content', '') if title else '',
                'description': description.get('content', '') if description else '',
                'thumbnail_url': image.get('content', '') if image else '',
                'author': '',
                'html': '',
                'width': 0,
                'height': 0,
                'hashtags': list(set(hashtags)),  # Remove duplicates
                'caption': caption
            }
            
        except Exception as e:
            logger.warning(f"Basic extraction failed: {e}")
            return {
                'title': 'Instagram Content',
                'description': 'Content from Instagram',
                'thumbnail_url': '',
                'author': '',
                'html': '',
                'width': 0,
                'height': 0
            }

    def _extract_hashtags(self, text: str) -> list:
        """Extract hashtags from text"""
        if not text:
            return []
        
        hashtags = re.findall(r'#(\w+)', text)
        return hashtags

    def is_instagram_url(self, url: str) -> bool:
        """Check if URL is from Instagram"""
        return 'instagram.com' in url.lower()
