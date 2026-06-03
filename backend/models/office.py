import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class Office(Base):
    __tablename__ = "offices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    address = Column(String, nullable=False)
    overall_manager_id = Column(String, nullable=True) # Azure AD ID
    qr_code = Column(String, nullable=True)
    qr_image_url = Column(String, nullable=True)
    qr_pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    ticket_count = Column(Integer, default=0)
    status = Column(String, default="active")

    departments = relationship("Department", back_populates="office", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    office_id = Column(UUID(as_uuid=True), ForeignKey("offices.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    manager_id = Column(String, nullable=True) # Azure AD ID

    office = relationship("Office", back_populates="departments")
    technicians = relationship("DepartmentTechnician", back_populates="department", cascade="all, delete-orphan")


class DepartmentTechnician(Base):
    __tablename__ = "department_technicians"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    technician_id = Column(String, nullable=False) # Azure AD ID

    department = relationship("Department", back_populates="technicians")
