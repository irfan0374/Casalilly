from typing import Tuple

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


def upload_image(file: UploadFile) -> Tuple[str, str]:
    result = cloudinary.uploader.upload(file.file, folder="casalilly/products")
    return result["secure_url"], result["public_id"]
