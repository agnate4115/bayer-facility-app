from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class DepartmentTechnicianBase(BaseModel):
    technician_id: str

class DepartmentBase(BaseModel):
    name: str
    manager_id: Optional[str] = None
    
class DepartmentCreate(DepartmentBase):
    technician_ids: List[str] = []

class DepartmentSchema(DepartmentBase):
    id: UUID
    office_id: UUID
    technician_ids: List[str] = []

    class Config:
        from_attributes = True

class OfficeBase(BaseModel):
    name: str
    city: str
    address: str
    overall_manager_id: Optional[str] = None

class OfficeCreate(OfficeBase):
    departments: List[DepartmentCreate] = []

class OfficeUpdate(OfficeBase):
    departments: List[DepartmentCreate] = []
    status: Optional[str] = "active"

class OfficeSchema(OfficeBase):
    id: UUID
    qr_code: Optional[str] = None
    qr_image_url: Optional[str] = None
    qr_pdf_url: Optional[str] = None
    created_at: datetime
    ticket_count: int
    status: str
    departments: List[DepartmentSchema] = []

    class Config:
        from_attributes = True
