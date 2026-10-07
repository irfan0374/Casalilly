from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.occasion import product_occasions

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    occasions = relationship("Occasion", secondary=product_occasions, lazy="selectin")

    @property
    def occasion_ids(self):
        return sorted(occasion.id for occasion in self.occasions)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    # The primary category (always categories[0]) — used for the product's
    # label on cards. Filtering by category matches any entry in `categories`.
    category = Column(String(50), index=True, nullable=False)
    categories = Column(ARRAY(String(50)), nullable=False, server_default="{}")
    image_url = Column(Text, nullable=False)
    image_public_id = Column(String(255), nullable=True)
    # Up to 3 additional gallery images (image_url is the required 1st/cover image, for 4 total).
    extra_image_urls = Column(ARRAY(Text), nullable=True)
    extra_image_public_ids = Column(ARRAY(String(255)), nullable=True)
    video_url = Column(Text, nullable=True)
    video_public_id = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
