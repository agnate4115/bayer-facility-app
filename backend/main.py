from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import offices, settings, tickets, feedback, audit_logs, reports, azure_auth
from database import engine, Base

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bayer Facility Management API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
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
    return {"message": "Welcome to Bayer Facility Management API"}
