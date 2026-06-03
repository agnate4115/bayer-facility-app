from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.audit_log import AuditLog
from schemas.audit_log import AuditLogResponse

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    # Return logs ordered by timestamp descending
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
