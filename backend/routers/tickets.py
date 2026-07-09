import json
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID

from database import get_db
from models.ticket import Ticket
from models.office import Office
from models.settings import IssueCategory, SystemSettings
from models.comment import TicketComment
from schemas.ticket import TicketSchema, TicketUpdate
from schemas.comment import CommentSchema, CommentCreate
from utils.ai_categorizer import categorize_ticket_ai
from utils.storage import upload_to_blob
from utils.audit import log_audit
from config import settings
from celery_worker import send_immediate_ticket_notifications, check_sla_escalation, send_feedback_reminder

router = APIRouter(
    prefix="/api/tickets",
    tags=["tickets"]
)

@router.post("/", response_model=TicketSchema)
async def create_ticket(
    office_id: UUID = Form(...),
    floor: str = Form(...),
    zone: str = Form(...),
    description: str = Form(...),
    user_id: str = Form(...),
    user_name: Optional[str] = Form(None),
    photos: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db)
):
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise HTTPException(status_code=404, detail="Office not found")
        
    # 1. Process image uploads
    image_urls = []
    for photo in photos:
        if photo.filename:
            file_bytes = await photo.read()
            url = upload_to_blob(file_bytes, f"ticket_{office_id}_{photo.filename}", photo.content_type, "tickets")
            if url:
                image_urls.append(url)
                
    # 2. AI Categorization
    categories_db = db.query(IssueCategory).all()
    category_names = [c.name for c in categories_db]
    ai_result = categorize_ticket_ai(description, category_names)
    
    cat_name = ai_result["category"]
    ai_summary = ai_result["summary"]
    priority = ai_result["priority"]
    
    # Match category in DB
    matched_cat = next((c for c in categories_db if c.name == cat_name), None)
    cat_id = matched_cat.id if matched_cat else None
    
    # 3. Auto-Assignment Logic
    assigned_to = office.overall_manager_id
    if cat_name:
        for dept in office.departments:
            if dept.name == cat_name and dept.manager_id:
                assigned_to = dept.manager_id
                break

    # 4. Save to DB
    new_ticket = Ticket(
        office_id=office_id,
        user_id=user_id,
        user_name=user_name,
        floor=floor,
        zone=zone,
        description=description,
        category_id=cat_id,
        category_name=cat_name,
        ai_summary=ai_summary,
        priority=priority,
        assigned_to=assigned_to,
        status="Open",
        image_urls=json.dumps(image_urls) if image_urls else None
    )
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    # Log Audit
    u_name = user_name or "Anonymous"
    log_audit(
        db=db,
        user_name=u_name,
        user_email=f"{u_name.replace(' ', '.').lower()}@bayer.com" if u_name != "Anonymous" else "anonymous@bayer.com",
        action="Created new ticket",
        action_type="Create",
        entity=str(new_ticket.id)[:8].upper(),
        entity_type="Ticket",
        details=f"Reported issue: {description[:50]}..."
    )
    
    # Unpack JSON for schema matching if needed
    if new_ticket.image_urls:
        new_ticket.image_urls = new_ticket.image_urls 
        
    if settings.ENABLE_AZURE_INTEGRATION:
        # Trigger immediate Teams Card and Outlook Email
        ticket_details = {
            "description": description,
            "floor": floor,
            "zone": zone,
            "priority": priority,
            "category": cat_name
        }
        tech_email = f"mock_{assigned_to}@bayer.com" # Would look up via Graph/DB in prod
        send_immediate_ticket_notifications.delay(str(new_ticket.id), tech_email, ticket_details)
        
        # Fetch SLA timings from DB
        sys_settings = db.query(SystemSettings).first()
        if sys_settings:
            countdown_mins = 30 # Default
            if priority == "P1":
                countdown_mins = sys_settings.p1_ack_mins
            elif priority == "P2":
                countdown_mins = sys_settings.p2_ack_mins
            elif priority == "P3":
                countdown_mins = sys_settings.p3_ack_hours * 60
                
            manager_email = "manager@bayer.com" # Look up via DB in prod
            check_sla_escalation.apply_async(args=[str(new_ticket.id), manager_email], countdown=countdown_mins * 60)
        
    return new_ticket

@router.get("/", response_model=List[TicketSchema])
def get_tickets(
    office_id: Optional[UUID] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    if office_id:
        query = query.filter(Ticket.office_id == office_id)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if status:
        query = query.filter(Ticket.status == status)
        
    tickets = query.options(joinedload(Ticket.office)).order_by(Ticket.created_at.desc()).all()
    return tickets

@router.get("/export")
def export_tickets(
    office_id: Optional[UUID] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    if office_id:
        query = query.filter(Ticket.office_id == office_id)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if status:
        query = query.filter(Ticket.status == status)
        
    tickets = query.options(joinedload(Ticket.office)).order_by(Ticket.created_at.desc()).all()
    
    # Log Audit
    log_audit(
        db=db,
        user_name="Admin",
        user_email="admin@bayer.com",
        action="Exported ticket data",
        action_type="Export",
        entity="Tickets Report",
        entity_type="Report",
        details=f"Exported {len(tickets)} tickets to CSV"
    )
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Office", "Floor", "Zone", "Category", 
        "AI Summary", "Priority", "Status", "Assigned To", 
        "Created At", "Description"
    ])
    
    for t in tickets:
        writer.writerow([
            t.id, 
            t.office.name if t.office else t.office_id, 
            t.floor, 
            t.zone, 
            t.category_name, 
            t.ai_summary, 
            t.priority, 
            t.status, 
            t.assigned_to, 
            t.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            t.description
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=tickets_export.csv"}
    )

@router.get("/{ticket_id}", response_model=TicketSchema)
def get_ticket(ticket_id: UUID, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/{ticket_id}", response_model=TicketSchema)
def update_ticket(ticket_id: UUID, ticket_update: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    update_data = ticket_update.model_dump(exclude_unset=True)
    changes = []
    for key, value in update_data.items():
        old_val = getattr(ticket, key)
        if old_val != value:
            changes.append(f"{key}: {old_val} -> {value}")
        setattr(ticket, key, value)
        
    db.commit()
    db.refresh(ticket)
    
    if changes:
        log_audit(
            db=db,
            user_name="System/Admin",
            user_email="admin@bayer.com",
            action="Updated ticket details",
            action_type="Update",
            entity=str(ticket.id)[:8].upper(),
            entity_type="Ticket",
            details=" | ".join(changes)
        )
        
    if settings.ENABLE_AZURE_INTEGRATION and ticket.status == "Closed" and "status" in update_data:
        # Trigger feedback reminders (45 mins and 3 hours)
        user_email = f"user_{ticket.user_id}@bayer.com" # Would look up via DB
        send_feedback_reminder.apply_async(args=[str(ticket.id), user_email, False], countdown=2700) # 45 mins
        send_feedback_reminder.apply_async(args=[str(ticket.id), user_email, True], countdown=10800) # 3 hours

    return ticket


# ── Ticket comments (admin ↔ employee conversation) ──

@router.get("/{ticket_id}/comments", response_model=List[CommentSchema])
def list_comments(ticket_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(TicketComment)
        .filter(TicketComment.ticket_id == ticket_id)
        .order_by(TicketComment.created_at.asc())
        .all()
    )


@router.post("/{ticket_id}/comments", response_model=CommentSchema)
def add_comment(ticket_id: UUID, payload: CommentCreate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    comment = TicketComment(
        ticket_id=ticket_id,
        author_name=payload.author_name,
        author_role=payload.author_role,
        message=payload.message,
        stage=payload.stage,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
