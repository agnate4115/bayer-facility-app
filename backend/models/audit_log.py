from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    user_avatar = Column(String, nullable=True)
    action = Column(String, nullable=False)
    action_type = Column(String, nullable=False) # e.g. Create, Update, Delete
    entity = Column(String, nullable=False) # e.g. BYR-THN-1234
    entity_type = Column(String, nullable=False) # e.g. Ticket, Office
    details = Column(Text, nullable=True)
