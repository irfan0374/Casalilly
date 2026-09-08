"""Seed the admin account from ADMIN_SEED_USERNAME / ADMIN_SEED_PASSWORD.

Usage: python -m app.seed
"""

from app.config import settings
from app.database import SessionLocal
from app.models.admin import Admin
from app.services.security import hash_password


def seed_admin() -> None:
    db = SessionLocal()
    try:
        username = settings.ADMIN_SEED_USERNAME
        password = settings.ADMIN_SEED_PASSWORD

        admin = db.query(Admin).filter(Admin.username == username).first()
        if admin is None:
            admin = Admin(username=username, hashed_password=hash_password(password))
            db.add(admin)
            db.commit()
            print(f"Created admin user '{username}'.")
        else:
            admin.hashed_password = hash_password(password)
            db.commit()
            print(f"Admin user '{username}' already exists; password updated.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
