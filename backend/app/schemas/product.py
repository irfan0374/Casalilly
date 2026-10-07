from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

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


def _dedupe(values: List[str]) -> List[str]:
    return list(dict.fromkeys(values))


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    image_url: str
    image_public_id: Optional[str] = None
    extra_image_urls: Optional[List[str]] = Field(default=None, max_length=3)
    extra_image_public_ids: Optional[List[str]] = Field(default=None, max_length=3)
    video_url: Optional[str] = None
    video_public_id: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False


class ProductCreate(ProductBase):
    # Send `categories`; `category` (the primary one) is always derived as
    # categories[0]. A lone `category` is still accepted from older clients.
    categories: List[CategoryLiteral] = Field(default_factory=list)
    category: Optional[CategoryLiteral] = None

    @model_validator(mode="after")
    def _sync_categories(self) -> "ProductCreate":
        categories = _dedupe(self.categories) or ([self.category] if self.category else [])
        if not categories:
            raise ValueError("Pick at least one category")
        self.categories = categories
        self.category = categories[0]
        return self


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    categories: Optional[List[CategoryLiteral]] = Field(default=None, min_length=1)
    category: Optional[CategoryLiteral] = None
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    extra_image_urls: Optional[List[str]] = Field(default=None, max_length=3)
    extra_image_public_ids: Optional[List[str]] = Field(default=None, max_length=3)
    video_url: Optional[str] = None
    video_public_id: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

    @model_validator(mode="after")
    def _sync_categories(self) -> "ProductUpdate":
        # Assigning here also marks the field as set, so exclude_unset dumps
        # carry both columns and they never drift apart.
        if self.categories is not None:
            self.categories = _dedupe(self.categories)
            self.category = self.categories[0]
        elif self.category is not None:
            self.categories = [self.category]
        return self


class ProductOut(ProductBase):
    category: str
    categories: List[str] = Field(default_factory=list)
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def _default_categories(self) -> "ProductOut":
        if not self.categories:
            self.categories = [self.category]
        return self


class CatalogSummary(BaseModel):
    total_products: int
    categories_with_products: List[str]
