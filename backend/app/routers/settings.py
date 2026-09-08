from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_admin, get_db
from app.models.admin import Admin
from app.models.site_settings import SiteSettings
from app.schemas.settings import SiteSettingsOut, SiteSettingsUpdate

public_router = APIRouter(prefix="/api", tags=["settings"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-settings"])

SETTINGS_ID = 1


def _get_or_create(db: Session) -> SiteSettings:
    row = db.query(SiteSettings).filter(SiteSettings.id == SETTINGS_ID).first()
    if row is None:
        row = SiteSettings(id=SETTINGS_ID)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@public_router.get("/settings", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db)) -> SiteSettings:
    return _get_or_create(db)


@admin_router.put("/settings", response_model=SiteSettingsOut)
def update_settings(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> SiteSettings:
    row = _get_or_create(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row
