"""Add a separate portrait image for phones to hero slides.

Revision ID: c9e1a4b7d302
Revises: b8d4e6f2a901
"""
from alembic import op
import sqlalchemy as sa

revision = "c9e1a4b7d302"
down_revision = "b8d4e6f2a901"
branch_labels = None
depends_on = None


def upgrade():
    # Nullable so banners saved before this change keep working; the admin
    # form requires it for new and edited banners.
    op.add_column("hero_slides", sa.Column("mobile_image_url", sa.Text(), nullable=True))
    op.add_column("hero_slides", sa.Column("mobile_image_public_id", sa.String(255), nullable=True))


def downgrade():
    op.drop_column("hero_slides", "mobile_image_public_id")
    op.drop_column("hero_slides", "mobile_image_url")
