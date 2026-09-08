from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class HeroSlide(Base):
    """One slide in the homepage hero banner. Admins can create several and
    toggle each active/inactive; the homepage rotates through the active ones."""

    __tablename__ = "hero_slides"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(Text, nullable=False)
    image_public_id = Column(String(255), nullable=True)
    heading = Column(String(255), nullable=True)
    subheading = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, server_default="true")
    sort_order = Column(Integer, default=0, nullable=False, server_default="0")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
