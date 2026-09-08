from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class HeroSlideBase(BaseModel):
    image_url: str
    image_public_id: Optional[str] = None
    heading: Optional[str] = None
    subheading: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


class HeroSlideCreate(HeroSlideBase):
    pass


class HeroSlideUpdate(BaseModel):
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    heading: Optional[str] = None
    subheading: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class HeroSlideOut(HeroSlideBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
