from datetime import datetime
from typing import Optional
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OccasionInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    image_url: str = Field(min_length=1)
    image_public_id: Optional[str] = None
    shop_link: Optional[str] = None
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def valid_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Enter an occasion name")
        return value

    @field_validator("image_url")
    @classmethod
    def valid_image(cls, value: str) -> str:
        value = value.strip()
        parsed = urlsplit(value)
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError("Use an HTTPS photo URL")
        return value

    @field_validator("shop_link")
    @classmethod
    def valid_shop_link(cls, value: Optional[str]) -> Optional[str]:
        if not value or not value.strip():
            return None
        value = value.strip()
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc or parsed.path != "/shop" or parsed.fragment or "\\" in value or any(ord(c) < 32 for c in value):
            raise ValueError("Use a shop link such as /shop?category=flowers, or leave it blank")
        return value


class OccasionOut(OccasionInput):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
