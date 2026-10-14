from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class HeroSlideBase(BaseModel):
    image_url: str
    image_public_id: Optional[str] = None
    # Optional here only so banners saved before mobile images existed still
    # serialize; HeroSlideCreate requires it.
    mobile_image_url: Optional[str] = None
    mobile_image_public_id: Optional[str] = None
    heading: Optional[str] = None
    subheading: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class HeroSlideCreate(HeroSlideBase):
    mobile_image_url: str


class HeroSlideUpdate(BaseModel):
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    mobile_image_url: Optional[str] = None
    mobile_image_public_id: Optional[str] = None
    heading: Optional[str] = None
    subheading: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class HeroSlideOut(HeroSlideBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
