from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    office_id = Column(UUID(as_uuid=True), ForeignKey('offices.id'), nullable=False)
    user_id = Column(String, nullable=False) # Azure AD user ID
    user_name = Column(String, nullable=True)
    floor = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    
    # AI generated fields
    category_id = Column(UUID(as_uuid=True), ForeignKey('issue_categories.id'), nullable=True)
    category_name = Column(String, nullable=True) # Fallback if category_id not strictly linked
    ai_summary = Column(String, nullable=True)
    priority = Column(String, default="P3") # P1, P2, P3
    
    assigned_to = Column(String, nullable=True) # AD User ID
    status = Column(String, default="Open") # Open, In Progress, Resolved, Closed
    
    # Comma separated or JSON encoded array of blob URLs
    image_urls = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    office = relationship("Office")
    category = relationship("IssueCategory")
    feedback = relationship('Feedback', back_populates='ticket', uselist=False)
