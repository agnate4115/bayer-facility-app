from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from database import get_db
from models.feedback import Feedback
from models.ticket import Ticket
from schemas.feedback import FeedbackCreate, FeedbackUpdate, FeedbackSchema

router = APIRouter(
    prefix="/api/feedback",
    tags=["feedback"]
)

@router.post("/", response_model=FeedbackSchema)
def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    # Check if ticket exists and is resolved/closed
    ticket = db.query(Ticket).filter(Ticket.id == feedback.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Check if feedback already exists for this ticket
    existing_feedback = db.query(Feedback).filter(Feedback.ticket_id == feedback.ticket_id).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback already exists for this ticket")
        
    new_feedback = Feedback(**feedback.model_dump())
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback

@router.get("/", response_model=List[FeedbackSchema])
def get_all_feedback(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Feedback)
    if user_id:
        query = query.filter(Feedback.user_id == user_id)
    return query.order_by(Feedback.created_at.desc()).all()

@router.get("/ticket/{ticket_id}", response_model=FeedbackSchema)
def get_feedback_by_ticket(ticket_id: UUID, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(Feedback.ticket_id == ticket_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found for this ticket")
    return feedback

@router.get("/{feedback_id}", response_model=FeedbackSchema)
def get_feedback(feedback_id: UUID, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback

@router.put("/{feedback_id}", response_model=FeedbackSchema)
def update_feedback(feedback_id: UUID, feedback_update: FeedbackUpdate, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
        
    update_data = feedback_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(feedback, key, value)
        
    db.commit()
    db.refresh(feedback)
    return feedback
