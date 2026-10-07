from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.sql import func

from app.database import Base

product_occasions = Table(
    "product_occasions", Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("occasion_id", Integer, ForeignKey("occasions.id", ondelete="CASCADE"), primary_key=True, index=True),
)


class Occasion(Base):
    __tablename__ = "occasions"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    image_url = Column(Text, nullable=False)
    image_public_id = Column(String(255), nullable=True)
    shop_link = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
