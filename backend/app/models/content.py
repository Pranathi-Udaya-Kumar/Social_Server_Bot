from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from .database import Base

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String(20), index=True, nullable=False)
    url = Column(String(500), nullable=False)
    platform = Column(String(50), nullable=False)
    title = Column(String(500))
    description = Column(Text)
    category = Column(String(50), nullable=False)
    tags = Column(JSON)  # Store as JSON array
    ai_summary = Column(Text)
    media_url = Column(String(500))
    thumbnail_url = Column(String(500))
    raw_data = Column(JSON)  # Store original extracted data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Content(id={self.id}, platform={self.platform}, category={self.category})>"
