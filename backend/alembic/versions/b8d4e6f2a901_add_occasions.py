"""Add editable occasions and product assignments.

Revision ID: b8d4e6f2a901
Revises: a7c3e1f9d2b4
"""
from alembic import op
import sqlalchemy as sa

revision = "b8d4e6f2a901"
down_revision = "a7c3e1f9d2b4"
branch_labels = None
depends_on = None


def upgrade():
    occasions = op.create_table(
        "occasions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("image_public_id", sa.String(255)),
        sa.Column("shop_link", sa.Text()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "product_occasions",
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("occasion_id", sa.Integer(), sa.ForeignKey("occasions.id", ondelete="CASCADE"), primary_key=True),
    )
    op.create_index("ix_product_occasions_occasion_id", "product_occasions", ["occasion_id"])
    op.bulk_insert(occasions, SEEDS)


def downgrade():
    op.drop_table("product_occasions")
    op.drop_table("occasions")


SEEDS = [{'name': 'Birthday', 'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW08IHCa3Tl6E0Cwwe9FqNC4LEa8v3orNvR0htl7ePXdQLO19lURo4yHJHBvhFtmhpBMTQs2a4ECbXsv-OqdaQfJxRNueqZNLJlo2C2Dh_-Fh5rosIzuDlhzJr2304AGmObTkGMteh3_SWgkLlDS3Q_me3dnbT4wuW8c6RTJIxiRXA3GA2Pq6F9VmnvaKLL5XZ14wbTVayMBNQh3Z1NXNNe8Wj7tIFSEx-09XHPho5', 'is_active': True}, {'name': 'Anniversary', 'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwB6Y5oYQPC0F9T9n5mMdwn0xfDkEW18kMWbp8VqfYfcmn6nEWJHhZWDStJDneVeK7Cp3bxqTmbsH0mqAelC5O6_skfyzpcwPT18tc3Rap9rN5JCg1Upx9MJr49aC4R1mkMjzwVEngiCbFVvI4Ud641ngjjjRmA8NWLwl14ue3mieOqNzRB_9v7LA73O1n3282lDREPDPZBcs7rxNdJ28K_YhtRdY9sGHUZ4yJQQd3', 'is_active': True}, {'name': 'New baby', 'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_yLigFRdygHDL1rmZB7SgeMXRr14hyqhEmnFBn-lNh29wbt41YzhdMB-vYq8zPtwv82R9-Uzbvc1yeoq5i8bi7YAST_0mVt_zbomtRcHReqEaFlet4N6PCxRli_LtDxgCfO1wc67-CudCDm35MZ20MGEUEtzhiH9cafd4YjBFGWpTFunq3w8YwpJfBOmYDpaUBlwQ-5qncbJr6qiEzwYKLQBCsowLjzYJYv09uYSw', 'is_active': True}, {'name': 'Get well soon', 'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0ZgTw9k7Pgb1JYPWf4vcSBqQemCVa1P1e-ahjo5HYdYaOgWrjEsf2Qi3Y0AtxTAJdQjE4SIyZrHQAKHcmCwD_aIcjmqRwCpdPu1diOEjDKNdQHCl1bxVPbEuuc05V_ERtXrVJqxuKX3F974yn4g1Y7AgeKl0vpnXKB7A3D8WVa6_fdMBhbX7SN28dbj-zAxc6YHp2sFjbPxx1BGJiS9UAW3V5RKtmgdColGEOCSL', 'is_active': True}, {'name': 'Thank you', 'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0oxcQIG9jPjzQ4c8lLpV94G82LQVFVmfa13LwoAOgsTnnTmGxtE-PThXVW5d82GNkiRw597nYnhG9QYB2DAeQphtF4PwlJTUVLcOE6NqmvrYYT9mpG85qocpvsgdsEGSHQQaPKLrsiHHIrpKTEQu9waMzGLi0uQblneY7qPnbwZK9s3kWQbnyQSLO5SxGTx8RBRbrqeUJGE40NWH2NzBvwYSsh_N2ogPlYuhTHEul', 'is_active': True}, {'name': 'Just because', 'image_url': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsqnOACjCHOas13aHz3MYmJTGZ9o7iXafIXe6l5vnTXkvgNwiFjWZjRF2gxli54a0YV6k3_zV0L1ZgwNzvL4I42PT8kGXfN4rIaVaBtidNn3_mflcvYcBJHZsdO-mPqD6f4johpuu2rtrOunqiDxvrEt05o71E6yWXUs5DJsLzWNGEZ0hbMKHu0YrsdHcBAd3QCDvgJMLKOtIvJ-ntApyv_ajA8Zg3XVYdYtYTKnBa', 'is_active': True}]
