from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class FeedbackBase(BaseModel):
    overall_rating: int
    resolution_quality: Optional[int] = None
    response_time: Optional[int] = None
    communication: Optional[int] = None
    professionalism: Optional[int] = None
    comments: Optional[str] = None
    went_well: Optional[str] = None
    improvements: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    ticket_id: UUID
    user_id: str

class FeedbackUpdate(FeedbackBase):
    overall_rating: Optional[int] = None

class FeedbackSchema(FeedbackBase):
    id: UUID
    ticket_id: UUID
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
