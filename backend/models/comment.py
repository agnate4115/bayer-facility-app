from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from database import Base


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)

    author_name = Column(String, nullable=False)
    author_role = Column(String, nullable=False)   # "Admin" | "Employee"
    message = Column(Text, nullable=False)
    stage = Column(String, nullable=True)          # optional ticket stage the comment relates to

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket")
