from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_admin, get_db
from app.models.admin import Admin
from app.models.hero_slide import HeroSlide
from app.schemas.hero_slide import HeroSlideCreate, HeroSlideOut, HeroSlideUpdate

public_router = APIRouter(prefix="/api", tags=["hero-slides"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-hero-slides"])


@public_router.get("/hero-slides", response_model=List[HeroSlideOut])
def list_active_hero_slides(db: Session = Depends(get_db)) -> List[HeroSlide]:
    return (
        db.query(HeroSlide)
        .filter(HeroSlide.is_active.is_(True))
        .order_by(HeroSlide.sort_order.asc(), HeroSlide.created_at.asc())
        .all()
    )


@admin_router.get("/hero-slides", response_model=List[HeroSlideOut])
def admin_list_hero_slides(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> List[HeroSlide]:
    return (
        db.query(HeroSlide)
        .order_by(HeroSlide.sort_order.asc(), HeroSlide.created_at.asc())
        .all()
    )


@admin_router.get("/hero-slides/{slide_id}", response_model=HeroSlideOut)
def admin_get_hero_slide(
    slide_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> HeroSlide:
    slide = db.query(HeroSlide).filter(HeroSlide.id == slide_id).first()
    if slide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hero slide not found")
    return slide


@admin_router.post("/hero-slides", response_model=HeroSlideOut, status_code=status.HTTP_201_CREATED)
def create_hero_slide(
    payload: HeroSlideCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> HeroSlide:
    slide = HeroSlide(**payload.model_dump())
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return slide


@admin_router.put("/hero-slides/{slide_id}", response_model=HeroSlideOut)
def update_hero_slide(
    slide_id: int,
    payload: HeroSlideUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> HeroSlide:
    slide = db.query(HeroSlide).filter(HeroSlide.id == slide_id).first()
    if slide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hero slide not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(slide, field, value)

    db.commit()
    db.refresh(slide)
    return slide


@admin_router.delete("/hero-slides/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hero_slide(
    slide_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> None:
    slide = db.query(HeroSlide).filter(HeroSlide.id == slide_id).first()
    if slide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hero slide not found")

    db.delete(slide)
    db.commit()
