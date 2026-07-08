from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import offices, settings, tickets, feedback, audit_logs, reports, azure_auth
from database import engine, Base

import logging
logger = logging.getLogger(__name__)

# Create DB Tables
try:
    Base.metadata.create_all(bind=engine)
    db_status = "Connected"
except Exception as e:
    logger.error(f"Failed to connect to database on startup: {e}")
    db_status = f"Disconnected: {e}"

app = FastAPI(title="Bayer Facility Management API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://thankful-bay-0a2aa9f00.7.azurestaticapps.net",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(offices.router)
app.include_router(settings.router)
app.include_router(tickets.router)
app.include_router(feedback.router)
app.include_router(audit_logs.router)
app.include_router(reports.router)
app.include_router(azure_auth.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Bayer Facility Management API",
        "database_status": db_status
    }
