from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    author_name: str
    author_role: str          # "Admin" | "Employee"
    message: str
    stage: Optional[str] = None


class CommentSchema(BaseModel):
    id: UUID
    ticket_id: UUID
    author_name: str
    author_role: str
    message: str
    stage: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
