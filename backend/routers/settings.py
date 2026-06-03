from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from models.settings import SystemSettings, IssueCategory
from schemas.settings import (
    SlaSettingsSchema, SlaSettingsUpdate,
    IssueCategorySchema, IssueCategoryCreate
)

router = APIRouter(
    prefix="/api/settings",
    tags=["settings"]
)

@router.get("/sla", response_model=SlaSettingsSchema)
def get_sla_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@router.put("/sla", response_model=SlaSettingsSchema)
def update_sla_settings(settings_data: SlaSettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings(**settings_data.dict())
        db.add(settings)
    else:
        for key, value in settings_data.dict().items():
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

@router.get("/categories", response_model=List[IssueCategorySchema])
def get_categories(db: Session = Depends(get_db)):
    return db.query(IssueCategory).order_by(IssueCategory.name).all()

@router.post("/categories", response_model=IssueCategorySchema)
def create_category(cat_data: IssueCategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(IssueCategory).filter(IssueCategory.name == cat_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    new_cat = IssueCategory(name=cat_data.name)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.delete("/categories/{cat_id}")
def delete_category(cat_id: UUID, db: Session = Depends(get_db)):
    cat = db.query(IssueCategory).filter(IssueCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted"}
