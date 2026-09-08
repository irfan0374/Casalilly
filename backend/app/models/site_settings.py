from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class SiteSettings(Base):
    """Singleton row (id=1) holding site-wide, admin-editable content.

    Hero banners and homepage carousels live in their own tables
    (HeroSlide, Carousel) since admins can create several of each; this row
    now only holds the About page copy.
    """

    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True)
    about_heading = Column(String(255), nullable=True)
    about_body = Column(Text, nullable=True)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
