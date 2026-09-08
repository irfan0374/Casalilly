from fastapi import APIRouter, Depends, UploadFile

from app.deps import get_current_admin
from app.models.admin import Admin
from app.services.cloudinary_service import upload_image

router = APIRouter(prefix="/api/admin", tags=["uploads"])


@router.post("/uploads")
def upload(
    file: UploadFile,
    current_admin: Admin = Depends(get_current_admin),
) -> dict[str, str]:
    url, public_id = upload_image(file)
    return {"url": url, "public_id": public_id}
