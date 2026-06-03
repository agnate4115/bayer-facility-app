from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class TicketBase(BaseModel):
    office_id: UUID
    floor: str
    zone: str
    description: str
    user_id: str
    user_name: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    category_id: Optional[UUID] = None

class TicketSchema(TicketBase):
    id: UUID
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    ai_summary: Optional[str] = None
    priority: str
    assigned_to: Optional[str] = None
    status: str
    image_urls: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
