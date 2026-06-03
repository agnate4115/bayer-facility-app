from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditLogCreate(BaseModel):
    user_name: str
    user_email: str
    user_avatar: Optional[str] = None
    action: str
    action_type: str
    entity: str
    entity_type: str
    details: Optional[str] = None

class AuditLogResponse(AuditLogCreate):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
