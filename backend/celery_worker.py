from celery import Celery
import asyncio
from datetime import datetime, timedelta
import logging
import json

from config import settings
from services.graph_service import send_outlook_email, send_teams_adaptive_card

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    "bayer_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

def get_facility_desk_token():
    if not settings.ENABLE_AZURE_INTEGRATION:
        return "mock-facility-desk-token"
    return "real-access-token-from-db"

def generate_interactive_card(ticket_id: str, priority: str, cat_name: str, location: str, desc: str) -> dict:
    """
    Generates a professional Adaptive Card (Actionable Message) 
    that allows the technician to update the ticket status directly from Teams or Outlook.
    """
    return {
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
            {
                "type": "ColumnSet",
                "columns": [
                    {
                        "type": "Column",
                        "width": "stretch",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": f"Ticket Assigned: {ticket_id}",
                                "weight": "Bolder",
                                "size": "Medium",
                                "color": "Accent"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": "auto",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": priority,
                                "weight": "Bolder",
                                "color": "Attention" if priority == "P1" else "Warning" if priority == "P2" else "Default",
                                "horizontalAlignment": "Right"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "FactSet",
                "spacing": "Medium",
                "facts": [
                    {"title": "Category:", "value": cat_name},
                    {"title": "Location:", "value": location}
                ]
            },
            {
                "type": "TextBlock",
                "text": "Description:",
                "weight": "Bolder",
                "spacing": "Medium"
            },
            {
                "type": "TextBlock",
                "text": desc,
                "wrap": True,
                "spacing": "Small"
            }
        ],
        "actions": [
            {
                "type": "Action.ShowCard",
                "title": "Update Status",
                "card": {
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "Select New Status:",
                            "weight": "Bolder"
                        },
                        {
                            "type": "Input.ChoiceSet",
                            "id": "newStatus",
                            "style": "compact",
                            "isMultiSelect": False,
                            "choices": [
                                {"title": "Acknowledged", "value": "Acknowledged"},
                                {"title": "Assigned", "value": "Assigned"},
                                {"title": "In Progress", "value": "In Progress"},
                                {"title": "On Hold", "value": "On Hold"},
                                {"title": "Resolved", "value": "Resolved"},
                                {"title": "Closed", "value": "Closed"},
                                {"title": "Escalated", "value": "Escalated"}
                            ]
                        },
                        {
                            "type": "Input.Text",
                            "id": "updateComments",
                            "placeholder": "Add any comments...",
                            "isMultiline": True
                        }
                    ],
                    "actions": [
                        {
                            "type": "Action.Http",
                            "title": "Submit Update",
                            "method": "PUT",
                            "url": f"https://bayer-facility.com/api/tickets/{ticket_id}/action",
                            "body": "{'status': '{{newStatus.value}}', 'comments': '{{updateComments.value}}'}",
                            "headers": [
                                {"name": "Content-Type", "value": "application/json"}
                            ]
                        }
                    ]
                }
            },
            {
                "type": "Action.OpenUrl",
                "title": "View in Portal",
                "url": f"https://bayer-facility.com/admin/tickets/{ticket_id}"
            }
        ]
    }


@celery_app.task
def send_immediate_ticket_notifications(ticket_id: str, technician_email: str, ticket_details: dict):
    """
    Fired immediately when a ticket is created.
    """
    logger.info(f"Executing immediate notifications for Ticket {ticket_id}")
    token = get_facility_desk_token()
    
    desc = ticket_details.get("description", "No description provided.")
    priority = ticket_details.get("priority", "P3")
    cat_name = ticket_details.get("category", "General")
    location = f"Floor {ticket_details.get('floor', 'Unknown')} - {ticket_details.get('zone', 'Unknown')}"
    
    # Generate the shared interactive card
    adaptive_card_json = generate_interactive_card(ticket_id, priority, cat_name, location, desc)
    
    # 1. Send Actionable Message via Outlook
    subject = f"Action Required: Ticket {ticket_id} Assigned [{priority}]"
    
    # The script tag allows Outlook to render the Adaptive Card directly in the email
    html_body = f"""
    <html>
    <head>
        <script type="application/adaptivecard+json">
            {json.dumps(adaptive_card_json)}
        </script>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F7FA; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E1E8ED; padding: 24px; }}
            .header {{ color: #00314E; font-size: 20px; font-weight: 600; margin-bottom: 16px; border-bottom: 2px solid #56D500; padding-bottom: 8px; }}
            .fallback {{ color: #4B5563; font-size: 14px; line-height: 1.5; }}
            .btn {{ display: inline-block; background-color: #00314E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 16px; font-weight: 500; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">FacilityDesk: Ticket Assignment</div>
            <div class="fallback">
                <p><strong>Ticket ID:</strong> {ticket_id} ({priority})</p>
                <p><strong>Location:</strong> {location}</p>
                <p><strong>Category:</strong> {cat_name}</p>
                <p><strong>Description:</strong><br/>{desc}</p>
                <p><em>If your email client does not support interactive Actionable Messages, please click the button below to update the ticket in the portal.</em></p>
                <a href="https://bayer-facility.com/admin/tickets/{ticket_id}" class="btn">Update in Portal</a>
            </div>
        </div>
    </body>
    </html>
    """
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(send_outlook_email(token, technician_email, subject, html_body))
    
    # 2. Send Teams Card
    loop.run_until_complete(send_teams_adaptive_card(token, technician_email, adaptive_card_json))


@celery_app.task
def check_sla_escalation(ticket_id: str, manager_email: str):
    """
    Fired after SLA timeframe. Escalates to manager.
    """
    logger.info(f"Checking SLA Escalation for Ticket {ticket_id}")
    if not settings.ENABLE_AZURE_INTEGRATION:
        return
        
    token = get_facility_desk_token()
    
    # Escalate with an Interactive Card so the manager can reassign
    adaptive_card_json = {
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
            {
                "type": "TextBlock",
                "text": f"SLA Breach: Ticket {ticket_id}",
                "weight": "Bolder",
                "size": "Medium",
                "color": "Attention"
            },
            {
                "type": "TextBlock",
                "text": "This ticket has breached its SLA acknowledgment limit. Please take action immediately.",
                "wrap": True
            }
        ],
        "actions": [
            {
                "type": "Action.ShowCard",
                "title": "Escalate / Reassign",
                "card": {
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "Select New Status:",
                            "weight": "Bolder"
                        },
                        {
                            "type": "Input.ChoiceSet",
                            "id": "managerAction",
                            "choices": [
                                {"title": "Reassign (Provide details in comments)", "value": "Reassign"},
                                {"title": "Acknowledged", "value": "Acknowledged"},
                                {"title": "Assigned", "value": "Assigned"},
                                {"title": "In Progress", "value": "In Progress"},
                                {"title": "On Hold", "value": "On Hold"},
                                {"title": "Resolved", "value": "Resolved"},
                                {"title": "Closed", "value": "Closed"},
                                {"title": "Escalated", "value": "Escalated"}
                            ]
                        },
                        {
                            "type": "Input.Text",
                            "id": "managerComments",
                            "placeholder": "Add comments or new assignee email...",
                            "isMultiline": True
                        }
                    ],
                    "actions": [
                        {
                            "type": "Action.Http",
                            "title": "Submit Manager Action",
                            "method": "POST",
                            "url": f"https://bayer-facility.com/api/tickets/{ticket_id}/escalate",
                            "body": "{'action': '{{managerAction.value}}', 'comments': '{{managerComments.value}}'}",
                            "headers": [{"name": "Content-Type", "value": "application/json"}]
                        }
                    ]
                }
            },
            {
                "type": "Action.OpenUrl",
                "title": "View in Portal",
                "url": f"https://bayer-facility.com/admin/tickets/{ticket_id}"
            }
        ]
    }

    subject = f"Action Required: SLA Breached for Ticket {ticket_id}"
    
    html_body = f"""
    <html>
    <head>
        <script type="application/adaptivecard+json">
            {json.dumps(adaptive_card_json)}
        </script>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #F5F7FA; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E1E8ED; padding: 24px; border-top: 4px solid #EF4444; }}
            .header {{ color: #EF4444; font-size: 20px; font-weight: 600; margin-bottom: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">SLA Escalation Alert</div>
            <p>Ticket <strong>{ticket_id}</strong> is unattended. Please use your supported mail client to reassign it interactively, or click the link below.</p>
            <a href="https://bayer-facility.com/admin/tickets/{ticket_id}" style="color: #00314E; font-weight: bold;">Manage in Portal</a>
        </div>
    </body>
    </html>
    """
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(send_outlook_email(token, manager_email, subject, html_body))

@celery_app.task
def send_feedback_reminder(ticket_id: str, user_email: str, is_final_reminder: bool = False):
    """
    Fired 45 mins (and 3 hrs) after ticket closure.
    """
    logger.info(f"Sending Feedback Reminder for Ticket {ticket_id}")
    if not settings.ENABLE_AZURE_INTEGRATION:
        return
    
    token = get_facility_desk_token()
    subject = "How did we do? Feedback request"
    link = f"https://bayer-facility.com/app/feedback/{ticket_id}"
    
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #F5F7FA; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E1E8ED; padding: 32px 24px; text-align: center; }}
            .btn {{ display: inline-block; background-color: #56D500; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; margin-top: 20px; }}
            h2 {{ color: #00314E; margin-top: 0; font-size: 20px; }}
            p {{ color: #4B5563; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Your issue has been resolved</h2>
            <p>Ticket {ticket_id} was recently closed. We'd love to know how our facility team did. It only takes a moment!</p>
            <a href="{link}" class="btn">Submit Feedback</a>
        </div>
    </body>
    </html>
    """
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(send_outlook_email(token, user_email, subject, html_body))
