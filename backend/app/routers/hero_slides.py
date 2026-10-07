from typing import List, Set, Tuple

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_admin, get_db
from app.models.admin import Admin
from app.models.hero_slide import HeroSlide
from app.schemas.hero_slide import HeroSlideCreate, HeroSlideOut, HeroSlideUpdate
from app.services.cloudinary_service import destroy_assets, public_id_from_url

public_router = APIRouter(prefix="/api", tags=["hero-slides"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-hero-slides"])


def _slide_assets(slide: HeroSlide) -> Set[Tuple[str, str]]:
    public_id = slide.image_public_id or public_id_from_url(slide.image_url)
    return {(public_id, "image")} if public_id else set()


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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> HeroSlide:
    slide = db.query(HeroSlide).filter(HeroSlide.id == slide_id).first()
    if slide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hero slide not found")

    assets_before = _slide_assets(slide)
    changes = payload.model_dump(exclude_unset=True)
    if "image_url" in changes and "image_public_id" not in changes:
        changes["image_public_id"] = None
    for field, value in changes.items():
        setattr(slide, field, value)

    db.commit()
    db.refresh(slide)
    background_tasks.add_task(destroy_assets, assets_before - _slide_assets(slide))
    return slide


@admin_router.delete("/hero-slides/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hero_slide(
    slide_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> None:
    slide = db.query(HeroSlide).filter(HeroSlide.id == slide_id).first()
    if slide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hero slide not found")

    assets = _slide_assets(slide)
    db.delete(slide)
    db.commit()
    background_tasks.add_task(destroy_assets, assets)
