from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..models.content import Content
from ..models.schemas import ContentCreate, ContentUpdate, PlatformType
import logging

logger = logging.getLogger(__name__)

class ContentService:
    def __init__(self, db: Session):
        self.db = db

    def create_content(self, content_data: ContentCreate) -> Content:
        """Create new content entry"""
        try:
            db_content = Content(
                user_phone=content_data.user_phone,
                url=str(content_data.url),
                platform=content_data.platform,
                title=content_data.title,
                description=content_data.description,
                category=content_data.category,
                tags=content_data.tags,
                ai_summary=content_data.ai_summary,
                media_url=str(content_data.media_url) if content_data.media_url else None,
                thumbnail_url=str(content_data.thumbnail_url) if content_data.thumbnail_url else None,
                raw_data=content_data.dict()
            )
            
            self.db.add(db_content)
            self.db.commit()
            self.db.refresh(db_content)
            
            logger.info(f"Created content: {db_content.id}")
            return db_content
            
        except Exception as e:
            logger.error(f"Error creating content: {e}")
            self.db.rollback()
            raise

    def get_user_contents(self, user_phone: str, skip: int = 0, limit: int = 50) -> List[Content]:
        """Get all content for a user"""
        try:
            return self.db.query(Content)\
                .filter(Content.user_phone == user_phone)\
                .order_by(Content.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
        except Exception as e:
            logger.error(f"Error getting user contents: {e}")
            raise

    def get_content_by_id(self, content_id: int) -> Optional[Content]:
        """Get content by ID"""
        try:
            return self.db.query(Content).filter(Content.id == content_id).first()
        except Exception as e:
            logger.error(f"Error getting content by ID: {e}")
            raise

    def search_contents(self, user_phone: str, query: str, skip: int = 0, limit: int = 50) -> List[Content]:
        """Search content by query"""
        try:
            search_pattern = f"%{query}%"
            return self.db.query(Content)\
                .filter(
                    Content.user_phone == user_phone,
                    (
                        Content.title.ilike(search_pattern) |
                        Content.description.ilike(search_pattern) |
                        Content.ai_summary.ilike(search_pattern) |
                        Content.category.ilike(search_pattern)
                    )
                )\
                .order_by(Content.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
        except Exception as e:
            logger.error(f"Error searching contents: {e}")
            raise

    def get_contents_by_category(self, user_phone: str, category: str, skip: int = 0, limit: int = 50) -> List[Content]:
        """Get contents by category"""
        try:
            return self.db.query(Content)\
                .filter(
                    Content.user_phone == user_phone,
                    Content.category == category
                )\
                .order_by(Content.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
        except Exception as e:
            logger.error(f"Error getting contents by category: {e}")
            raise

    def update_content(self, content_id: int, content_update: ContentUpdate) -> Optional[Content]:
        """Update content"""
        try:
            db_content = self.get_content_by_id(content_id)
            if not db_content:
                return None

            update_data = content_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_content, field, value)

            self.db.commit()
            self.db.refresh(db_content)
            
            logger.info(f"Updated content: {content_id}")
            return db_content
            
        except Exception as e:
            logger.error(f"Error updating content: {e}")
            self.db.rollback()
            raise

    def delete_content(self, content_id: int) -> bool:
        """Delete content"""
        try:
            db_content = self.get_content_by_id(content_id)
            if not db_content:
                return False

            self.db.delete(db_content)
            self.db.commit()
            
            logger.info(f"Deleted content: {content_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting content: {e}")
            self.db.rollback()
            raise

    def get_user_stats(self, user_phone: str) -> dict:
        """Get user content statistics"""
        try:
            total_contents = self.db.query(Content)\
                .filter(Content.user_phone == user_phone)\
                .count()
            
            category_counts = self.db.query(Content.category, func.count(Content.id))\
                .filter(Content.user_phone == user_phone)\
                .group_by(Content.category)\
                .all()
            
            return {
                "total_contents": total_contents,
                "category_counts": dict(category_counts)
            }
        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            raise
