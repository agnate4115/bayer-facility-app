from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from database import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id"), unique=True, nullable=False, index=True)
    user_id = Column(String, index=True, nullable=False)
    
    overall_rating = Column(Integer, nullable=False)
    resolution_quality = Column(Integer, nullable=True)
    response_time = Column(Integer, nullable=True)
    communication = Column(Integer, nullable=True)
    professionalism = Column(Integer, nullable=True)
    
    comments = Column(Text, nullable=True)
    went_well = Column(Text, nullable=True)
    improvements = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to ticket
    ticket = relationship("Ticket", back_populates="feedback")
