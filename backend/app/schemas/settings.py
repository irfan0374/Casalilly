from typing import Optional

from pydantic import BaseModel, ConfigDict


class SiteSettingsOut(BaseModel):
    about_heading: Optional[str] = None
    about_body: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SiteSettingsUpdate(BaseModel):
    about_heading: Optional[str] = None
    about_body: Optional[str] = None
