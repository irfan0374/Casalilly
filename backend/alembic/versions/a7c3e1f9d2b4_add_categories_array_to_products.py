"""add categories array to products

Lets a product belong to several categories. The existing `category` column
stays as the product's primary category (always categories[0]) so labels
and older clients keep working.

Revision ID: a7c3e1f9d2b4
Revises: 5b60719b25c1
Create Date: 2026-10-07 07:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a7c3e1f9d2b4'
down_revision: Union[str, Sequence[str], None] = '5b60719b25c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'products',
        sa.Column(
            'categories',
            postgresql.ARRAY(sa.String(length=50)),
            nullable=False,
            server_default='{}',
        ),
    )
    # Every existing product starts out in just its current category.
    op.execute("UPDATE products SET categories = ARRAY[category]")
    op.create_index(
        'ix_products_categories', 'products', ['categories'], postgresql_using='gin'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_products_categories', table_name='products')
    op.drop_column('products', 'categories')
