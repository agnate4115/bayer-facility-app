import httpx
from config import settings
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Base URL for Microsoft Graph API
GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"

async def get_user_profile(access_token: str) -> Dict[str, Any]:
    """
    Fetch the basic profile of the logged in user (Name, Email, Job Title, Department).
    """
    if not settings.ENABLE_AZURE_INTEGRATION:
        return {
            "displayName": "Mock User",
            "mail": "mock@bayer.com",
            "jobTitle": "Mock Technician",
            "department": "IT",
            "officeLocation": "Thane",
            "id": "mock-user-id"
        }
        
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{GRAPH_API_BASE}/me?$select=id,displayName,mail,jobTitle,department,officeLocation", headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Error fetching user profile: {response.text}")
            return {}

async def get_user_member_groups(access_token: str) -> list[str]:
    """
    Fetch the Security Group Object IDs the user is a member of.
    """
    if not settings.ENABLE_AZURE_INTEGRATION:
        # Mock group ID for testing (Super Admin)
        return ["mock-super-admin-group"]
        
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{GRAPH_API_BASE}/me/getMemberGroups", headers=headers, json={"securityEnabledOnly": True})
        if response.status_code == 200:
            return response.json().get("value", [])
        else:
            logger.error(f"Error fetching user groups: {response.text}")
            return []

async def get_user_photo(access_token: str) -> Optional[bytes]:
    """
    Fetch the user's display picture (DP).
    """
    if not settings.ENABLE_AZURE_INTEGRATION:
        return None
        
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{GRAPH_API_BASE}/me/photo/$value", headers=headers)
        if response.status_code == 200:
            return response.content
        else:
            logger.warning(f"User photo not found or error: {response.status_code}")
            return None

async def send_outlook_email(access_token: str, to_email: str, subject: str, html_body: str):
    """
    Send an email via Outlook using Microsoft Graph.
    """
    if not settings.ENABLE_AZURE_INTEGRATION:
        logger.info(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        return True
        
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    email_msg = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": html_body
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": to_email
                    }
                }
            ]
        },
        "saveToSentItems": "true"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{GRAPH_API_BASE}/me/sendMail", headers=headers, json=email_msg)
        if response.status_code == 202:
            return True
        else:
            logger.error(f"Failed to send email: {response.text}")
            return False

async def send_teams_adaptive_card(access_token: str, user_email: str, card_payload: dict):
    """
    Send a Teams Adaptive Card to a specific user.
    Note: Sending a proactive message requires getting the chat ID first.
    """
    if not settings.ENABLE_AZURE_INTEGRATION:
        logger.info(f"[MOCK TEAMS CARD] To: {user_email}")
        return True
        
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        # Step 1: Create or get a 1-on-1 chat with the user
        chat_payload = {
            "chatType": "oneOnOne",
            "members": [
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "roles": ["owner"],
                    "user@odata.bind": "https://graph.microsoft.com/v1.0/me"
                },
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "roles": ["owner"],
                    "user@odata.bind": f"https://graph.microsoft.com/v1.0/users('{user_email}')"
                }
            ]
        }
        
        chat_res = await client.post(f"{GRAPH_API_BASE}/chats", headers=headers, json=chat_payload)
        if chat_res.status_code not in (200, 201):
            logger.error(f"Failed to create/get chat: {chat_res.text}")
            return False
            
        chat_id = chat_res.json().get("id")
        
        # Step 2: Send the adaptive card message to the chat
        message_payload = {
            "body": {
                "contentType": "html",
                "content": "<attachment id=\"card1\"></attachment>"
            },
            "attachments": [
                {
                    "id": "card1",
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "contentUrl": None,
                    "content": card_payload
                }
            ]
        }
        
        msg_res = await client.post(f"{GRAPH_API_BASE}/chats/{chat_id}/messages", headers=headers, json=message_payload)
        if msg_res.status_code == 201:
            return True
        else:
            logger.error(f"Failed to send adaptive card: {msg_res.text}")
            return False
