from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from typing import List

from database import get_db
from models.office import Office, Department, DepartmentTechnician
from schemas.office import OfficeCreate, OfficeUpdate, OfficeSchema
from utils.qr_generator import generate_office_qr_assets
from utils.audit import log_audit

router = APIRouter(
    prefix="/api/offices",
    tags=["offices"]
)

# Helper function to convert DB Office model to Pydantic Schema
def map_office_to_schema(office: Office) -> dict:
    office_dict = {
        "id": office.id,
        "name": office.name,
        "city": office.city,
        "address": office.address,
        "overall_manager_id": office.overall_manager_id,
        "qr_code": office.qr_code,
        "qr_image_url": office.qr_image_url,
        "qr_pdf_url": office.qr_pdf_url,
        "created_at": office.created_at,
        "ticket_count": office.ticket_count,
        "status": office.status,
        "departments": []
    }
    for dept in office.departments:
        dept_dict = {
            "id": dept.id,
            "office_id": dept.office_id,
            "name": dept.name,
            "manager_id": dept.manager_id,
            "technician_ids": [tech.technician_id for tech in dept.technicians]
        }
        office_dict["departments"].append(dept_dict)
    return office_dict


@router.get("/", response_model=List[OfficeSchema])
def get_offices(db: Session = Depends(get_db)):
    offices = db.query(Office).options(
        joinedload(Office.departments).joinedload(Department.technicians)
    ).all()
    return [map_office_to_schema(office) for office in offices]


@router.post("/", response_model=OfficeSchema)
def create_office(office_data: OfficeCreate, db: Session = Depends(get_db)):
    # Generate QR Code
    office_code = "".join(filter(str.isalpha, office_data.name))[:3].upper()
    qr_code = f"BAYER-{office_code}"
    
    new_office = Office(
        name=office_data.name,
        city=office_data.city,
        address=office_data.address,
        overall_manager_id=office_data.overall_manager_id,
        qr_code=qr_code
    )
    db.add(new_office)
    db.flush() # To get the new_office.id

    # Generate QR Assets and update URLs
    img_url, pdf_url = generate_office_qr_assets(str(new_office.id), new_office.name, qr_code)
    new_office.qr_image_url = img_url
    new_office.qr_pdf_url = pdf_url

    for dept_data in office_data.departments:
        new_dept = Department(
            office_id=new_office.id,
            name=dept_data.name,
            manager_id=dept_data.manager_id
        )
        db.add(new_dept)
        db.flush()
        
        for tech_id in dept_data.technician_ids:
            new_tech = DepartmentTechnician(
                department_id=new_dept.id,
                technician_id=tech_id
            )
            db.add(new_tech)

    db.commit()
    db.refresh(new_office)
    
    # Log Audit
    log_audit(
        db=db,
        user_name="System/Admin",
        user_email="admin@bayer.com",
        action="Created new office",
        action_type="Create",
        entity=new_office.name,
        entity_type="Office",
        details=f"Added new office location: {new_office.city}"
    )
    
    return map_office_to_schema(new_office)


@router.put("/{office_id}", response_model=OfficeSchema)
def update_office(office_id: UUID, office_data: OfficeUpdate, db: Session = Depends(get_db)):
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise HTTPException(status_code=404, detail="Office not found")
        
    office.name = office_data.name
    office.city = office_data.city
    office.address = office_data.address
    office.overall_manager_id = office_data.overall_manager_id
    office.status = office_data.status

    if not office.qr_image_url or not office.qr_pdf_url:
        img_url, pdf_url = generate_office_qr_assets(str(office.id), office.name, office.qr_code)
        office.qr_image_url = img_url
        office.qr_pdf_url = pdf_url

    new_departments = []
    for dept_data in office_data.departments:
        new_dept = Department(
            name=dept_data.name,
            manager_id=dept_data.manager_id
        )
        for tech_id in dept_data.technician_ids:
            new_dept.technicians.append(DepartmentTechnician(technician_id=tech_id))
        new_departments.append(new_dept)
        
    office.departments = new_departments

    db.commit()
    db.refresh(office)
    
    # Log Audit
    log_audit(
        db=db,
        user_name="System/Admin",
        user_email="admin@bayer.com",
        action="Updated office details",
        action_type="Update",
        entity=office.name,
        entity_type="Office",
        details=f"Updated office information for {office.name}"
    )
    
    return map_office_to_schema(office)


@router.post("/regenerate-qr")
def regenerate_all_qr(db: Session = Depends(get_db)):
    """Force-regenerate QR image + PDF assets for every office.
    Used to refresh assets built by an older generator (e.g. missing logo)."""
    offices = db.query(Office).all()
    count = 0
    for office in offices:
        code = office.qr_code or f"BAYER-{office.name[:3].upper()}"
        img_url, pdf_url = generate_office_qr_assets(str(office.id), office.name, code)
        office.qr_image_url = img_url
        office.qr_pdf_url = pdf_url
        count += 1
    db.commit()
    return {"regenerated": count}


@router.delete("/{office_id}")
def delete_office(office_id: UUID, db: Session = Depends(get_db)):
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise HTTPException(status_code=404, detail="Office not found")
        
    db.delete(office)
    db.commit()
    return {"message": "Office deleted successfully"}
