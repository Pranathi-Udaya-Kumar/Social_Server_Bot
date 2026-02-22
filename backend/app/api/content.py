from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.database import get_db
from ..models.schemas import ContentResponse, ContentListResponse, APIResponse
from ..services.content_service import ContentService

router = APIRouter()

@router.get("/", response_model=ContentListResponse)
async def get_contents(
    user_phone: str = Query(..., description="User phone number"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search query"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    db: Session = Depends(get_db)
):
    """Get user's saved content"""
    try:
        content_service = ContentService(db)
        
        if search:
            contents = content_service.search_contents(user_phone, search, skip, limit)
        elif category:
            contents = content_service.get_contents_by_category(user_phone, category, skip, limit)
        else:
            contents = content_service.get_user_contents(user_phone, skip, limit)
        
        total = len(contents) if len(contents) < limit else None
        
        return ContentListResponse(
            contents=[ContentResponse.from_orm(content) for content in contents],
            total=total or 0,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: int,
    db: Session = Depends(get_db)
):
    """Get specific content by ID"""
    try:
        content_service = ContentService(db)
        content = content_service.get_content_by_id(content_id)
        
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        return ContentResponse.from_orm(content)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{content_id}", response_model=APIResponse)
async def delete_content(
    content_id: int,
    db: Session = Depends(get_db)
):
    """Delete content"""
    try:
        content_service = ContentService(db)
        success = content_service.delete_content(content_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Content not found")
        
        return APIResponse(
            success=True,
            message="Content deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/{user_phone}", response_model=dict)
async def get_user_stats(
    user_phone: str,
    db: Session = Depends(get_db)
):
    """Get user content statistics"""
    try:
        content_service = ContentService(db)
        stats = content_service.get_user_stats(user_phone)
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
