from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PlatformType(str, Enum):
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    BLOG = "blog"
    YOUTUBE = "youtube"
    OTHER = "other"

class CategoryType(str, Enum):
    FITNESS = "fitness"
    CODING = "coding"
    FOOD = "food"
    TRAVEL = "travel"
    DESIGN = "design"
    FASHION = "fashion"
    BUSINESS = "business"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    OTHER = "other"

# Content Models
class ContentBase(BaseModel):
    url: str
    platform: PlatformType
    title: Optional[str] = None
    description: Optional[str] = None
    category: CategoryType
    tags: List[str] = []
    ai_summary: Optional[str] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

class ContentCreate(ContentBase):
    user_phone: str

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[CategoryType] = None
    tags: Optional[List[str]] = None
    ai_summary: Optional[str] = None

class ContentResponse(ContentBase):
    id: int
    user_phone: str
    created_at: datetime
    updated_at: Optional[datetime] = None  # FIX: was required datetime, crashes when None

    class Config:
        from_attributes = True

# WhatsApp Models
class WhatsAppMessage(BaseModel):
    From: str
    To: str
    Body: str
    MessageSid: str

class WhatsAppResponse(BaseModel):
    message: str

# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ContentListResponse(BaseModel):
    contents: List[ContentResponse]
    total: int
    page: int
    size: int