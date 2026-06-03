from sqlalchemy.orm import Session
from models.audit_log import AuditLog

def log_audit(db: Session, user_name: str, user_email: str, action: str, action_type: str, entity: str, entity_type: str, details: str = None, user_avatar: str = None):
    """
    Helper function to log an action to the audit_logs table.
    """
    if not user_avatar:
        user_avatar = f"https://ui-avatars.com/api/?name={user_name.replace(' ', '+')}&background=00314E&color=fff&size=64&bold=true"
        
    audit_entry = AuditLog(
        user_name=user_name,
        user_email=user_email,
        user_avatar=user_avatar,
        action=action,
        action_type=action_type,
        entity=entity,
        entity_type=entity_type,
        details=details
    )
    db.add(audit_entry)
    db.commit()
