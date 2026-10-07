from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_admin, get_db
from app.models.admin import Admin
from app.models.occasion import Occasion
from app.schemas.occasion import OccasionInput, OccasionOut

public_router = APIRouter(prefix="/api", tags=["occasions"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-occasions"])


def find_occasion(occasion_id: int, db: Session) -> Occasion:
    occasion = db.get(Occasion, occasion_id)
    if occasion is None:
        raise HTTPException(status_code=404, detail="Occasion not found")
    return occasion


@public_router.get("/occasions", response_model=List[OccasionOut])
def list_occasions(db: Session = Depends(get_db)):
    return db.query(Occasion).filter(Occasion.is_active.is_(True)).order_by(Occasion.id).all()


@admin_router.get("/occasions", response_model=List[OccasionOut])
def admin_list_occasions(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    return db.query(Occasion).order_by(Occasion.id).all()


@admin_router.get("/occasions/{occasion_id}", response_model=OccasionOut)
def get_occasion(occasion_id: int, db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    return find_occasion(occasion_id, db)


@admin_router.post("/occasions", response_model=OccasionOut, status_code=status.HTTP_201_CREATED)
def create_occasion(payload: OccasionInput, db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    occasion = Occasion(**payload.model_dump())
    db.add(occasion)
    db.commit()
    db.refresh(occasion)
    return occasion


@admin_router.put("/occasions/{occasion_id}", response_model=OccasionOut)
def update_occasion(occasion_id: int, payload: OccasionInput, db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    occasion = find_occasion(occasion_id, db)
    for field, value in payload.model_dump().items():
        setattr(occasion, field, value)
    db.commit()
    db.refresh(occasion)
    return occasion


@admin_router.delete("/occasions/{occasion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_occasion(occasion_id: int, db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    occasion = find_occasion(occasion_id, db)
    # The association foreign key cascades; the products themselves remain.
    db.delete(occasion)
    db.commit()
