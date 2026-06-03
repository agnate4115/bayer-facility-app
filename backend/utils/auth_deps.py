from fastapi import Depends, HTTPException
from typing import Optional
import logging

from config import settings

logger = logging.getLogger(__name__)

# Mock user session class
class UserSession:
    def __init__(self, user_id: str, role: str, department: Optional[str] = None, office_id: Optional[str] = None):
        self.user_id = user_id
        self.role = role # "Super Admin", "Office Manager", "Category Manager", "Technician"
        self.department = department
        self.office_id = office_id

def get_current_user(token: str = "mock-token") -> UserSession:
    """
    Dependency that decodes the JWT/session token and returns the current user profile.
    """
    if not settings.ENABLE_AZURE_INTEGRATION:
        # Return a mock Super Admin by default if Azure is disabled
        return UserSession(user_id="mock-super-admin", role="Super Admin")
        
    # TODO: In prod, validate `token`, lookup user session in DB/Redis
    # For now, returning a mock
    return UserSession(user_id="prod-user", role="Technician", department="HVAC")

def require_role(allowed_roles: list[str]):
    """
    Dependency factory to enforce RBAC.
    """
    def role_checker(current_user: UserSession = Depends(get_current_user)):
        if not settings.ENABLE_AZURE_INTEGRATION:
            return current_user
            
        if current_user.role not in allowed_roles and current_user.role != "Super Admin":
            logger.warning(f"Access denied for {current_user.user_id} with role {current_user.role}")
            raise HTTPException(status_code=403, detail="Not authorized to perform this action")
        return current_user
        
    return role_checker
