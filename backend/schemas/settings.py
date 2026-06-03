from pydantic import BaseModel
from typing import List
from uuid import UUID

class SlaSettingsBase(BaseModel):
    p1_ack_mins: int
    p1_res_mins: int
    p2_ack_mins: int
    p2_res_mins: int
    p3_ack_hours: int
    p3_res_hours: int

class SlaSettingsUpdate(SlaSettingsBase):
    pass

class SlaSettingsSchema(SlaSettingsBase):
    id: UUID

    class Config:
        from_attributes = True

class IssueCategoryBase(BaseModel):
    name: str

class IssueCategoryCreate(IssueCategoryBase):
    pass

class IssueCategorySchema(IssueCategoryBase):
    id: UUID

    class Config:
        from_attributes = True
