from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import msal
import logging
import base64

from config import settings
from services.graph_service import get_user_profile, get_user_member_groups, get_user_photo

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

logger = logging.getLogger(__name__)

class AzureLoginRequest(BaseModel):
    access_token: str # From the frontend MSAL login
    refresh_token: Optional[str] = None

class AzureLoginResponse(BaseModel):
    token: str # Custom JWT or session token for our backend
    user: dict

# In a real app, map these to actual Azure AD Object IDs
GROUP_IDS = {
    "technicians": "mock-group-1",
    "category_managers": "mock-group-2", 
    "office_managers": "mock-group-3",
    "super_admins": "mock-super-admin-group"
}

def determine_role(group_ids: list[str]) -> str:
    if not settings.ENABLE_AZURE_INTEGRATION:
        return "Super Admin"
        
    if GROUP_IDS["super_admins"] in group_ids:
        return "Super Admin"
    if GROUP_IDS["office_managers"] in group_ids:
        return "Office Manager"
    if GROUP_IDS["category_managers"] in group_ids:
        return "Category Manager"
    if GROUP_IDS["technicians"] in group_ids:
        return "Technician"
        
    return "Employee"

@router.post("/azure-login")
async def azure_login(request: AzureLoginRequest):
    """
    Called by the frontend after MSAL login.
    Validates token via Microsoft Graph, fetches profile & DP, and assigns RBAC role.
    """
    if not settings.ENABLE_AZURE_INTEGRATION:
        # Mock successful login
        return {
            "token": "mock-jwt-token-123",
            "user": {
                "id": "mock-user-id",
                "name": "Priya Patel",
                "email": "priya@bayer.com",
                "role": "Super Admin",
                "department": "IT",
                "officeLocation": "Thane",
                "dp_url": None
            }
        }
        
    try:
        # 1. Fetch Profile
        profile = await get_user_profile(request.access_token)
        if not profile:
            raise HTTPException(status_code=401, detail="Invalid Microsoft Token")
            
        # 2. Fetch Groups & Determine Role
        groups = await get_user_member_groups(request.access_token)
        role = determine_role(groups)
        
        # 3. Fetch DP
        dp_bytes = await get_user_photo(request.access_token)
        dp_url = None
        if dp_bytes:
            b64_img = base64.b64encode(dp_bytes).decode('utf-8')
            dp_url = f"data:image/jpeg;base64,{b64_img}"
            
        # If this is the Facility Desk account, we'd save the refresh token to DB here
        if profile.get('mail', '').lower().startswith('facilitydesk'):
            # TODO: Save request.refresh_token to DB securely
            logger.info("Facility Desk logged in. Captured refresh token.")

        # 4. Generate internal token (mocked for now)
        internal_token = "mock-internal-jwt-" + profile.get("id", "")
        
        return {
            "token": internal_token,
            "user": {
                "id": profile.get("id"),
                "name": profile.get("displayName"),
                "email": profile.get("mail"),
                "designation": profile.get("jobTitle"),
                "role": role,
                "department": profile.get("department"),
                "officeLocation": profile.get("officeLocation"),
                "dp_url": dp_url
            }
        }
        
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication processing failed")
