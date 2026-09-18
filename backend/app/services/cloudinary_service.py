import time
from typing import Tuple

import cloudinary
import cloudinary.uploader
import cloudinary.utils
from fastapi import UploadFile

from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

PRODUCTS_FOLDER = "casalilly/products"


def upload_image(file: UploadFile) -> Tuple[str, str]:
    result = cloudinary.uploader.upload(file.file, folder=PRODUCTS_FOLDER)
    return result["secure_url"], result["public_id"]


def generate_video_upload_signature() -> dict:
    """Lets the browser upload a video straight to Cloudinary instead of
    relaying the file through our backend (which meant every byte crossed
    the network twice — client to Render, then Render to Cloudinary — and
    tied up a server thread/memory for the whole transfer). Only the
    parameters that will actually be sent to Cloudinary's upload API need to
    be part of the signature (not `resource_type`, `api_key`, or `cloud_name`
    — those are exempted by Cloudinary's own signing rules)."""
    timestamp = int(time.time())
    params_to_sign = {"timestamp": timestamp, "folder": PRODUCTS_FOLDER}
    signature = cloudinary.utils.api_sign_request(
        params_to_sign, settings.CLOUDINARY_API_SECRET
    )
    return {
        "signature": signature,
        "timestamp": timestamp,
        "api_key": settings.CLOUDINARY_API_KEY,
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "folder": PRODUCTS_FOLDER,
    }
