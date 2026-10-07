import logging
import re
import time
from typing import Iterable, Optional, Tuple

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

logger = logging.getLogger(__name__)


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


# Matches the path part of a Cloudinary delivery URL — e.g.
# .../image/upload/v1712345678/casalilly/products/abc123.jpg — capturing the
# public id ("casalilly/products/abc123") without the version or extension.
_CLOUDINARY_PATH_RE = re.compile(r"/(image|video)/upload/(?:v\d+/)?(.+?)(?:\.[^./]+)?$")


def public_id_from_url(url: Optional[str]) -> Optional[str]:
    """Recovers the public id for one of our own uploads from its URL — used
    for rows saved before public ids were tracked, so their assets can still
    be cleaned up. Returns None for anything outside our uploads folder."""
    if not url:
        return None
    match = _CLOUDINARY_PATH_RE.search(url)
    if match is None or not match.group(2).startswith(PRODUCTS_FOLDER + "/"):
        return None
    return match.group(2)


def destroy_assets(assets: Iterable[Tuple[str, str]]) -> None:
    """Deletes (public_id, resource_type) pairs from Cloudinary. Best-effort:
    runs as a background task after the database change has already been
    committed, so a Cloudinary hiccup only leaves an orphaned file behind
    instead of failing the admin's save/delete."""
    for public_id, resource_type in assets:
        try:
            cloudinary.uploader.destroy(public_id, resource_type=resource_type, invalidate=True)
        except Exception:
            logger.exception("Failed to delete Cloudinary asset %s", public_id)
