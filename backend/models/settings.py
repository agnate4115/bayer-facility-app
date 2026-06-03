from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    p1_ack_mins = Column(Integer, default=15)
    p1_res_mins = Column(Integer, default=120)
    p2_ack_mins = Column(Integer, default=30)
    p2_res_mins = Column(Integer, default=480)
    p3_ack_hours = Column(Integer, default=2)
    p3_res_hours = Column(Integer, default=48)

class IssueCategory(Base):
    __tablename__ = "issue_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
