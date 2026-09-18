from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

CATEGORIES = [
    "flowers",
    "bouquets",
    "gift_baskets",
    "anniversary",
    "chocolate",
    "plants",
    "other",
]

CategoryLiteral = Literal[
    "flowers",
    "bouquets",
    "gift_baskets",
    "anniversary",
    "chocolate",
    "plants",
    "other",
]


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    category: CategoryLiteral
    image_url: str
    image_public_id: Optional[str] = None
    extra_image_urls: Optional[List[str]] = Field(default=None, max_length=3)
    extra_image_public_ids: Optional[List[str]] = Field(default=None, max_length=3)
    video_url: Optional[str] = None
    video_public_id: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[CategoryLiteral] = None
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    extra_image_urls: Optional[List[str]] = Field(default=None, max_length=3)
    extra_image_public_ids: Optional[List[str]] = Field(default=None, max_length=3)
    video_url: Optional[str] = None
    video_public_id: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
