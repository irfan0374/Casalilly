from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.config import settings
from app.deps import get_db
from app.models.product import Product

router = APIRouter(tags=["social-preview"])

templates = Jinja2Templates(directory="app/templates")

CRAWLER_UA_SUBSTRINGS = [
    "whatsapp",
    "facebookexternalhit",
    "facebot",
    "twitterbot",
    "linkedinbot",
    "telegrambot",
    "slackbot",
]


@router.get("/product/{product_id}")
async def product_page(product_id: int, request: Request, db: Session = Depends(get_db)):
    ua = request.headers.get("user-agent", "").lower()

    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if any(s in ua for s in CRAWLER_UA_SUBSTRINGS):
        return templates.TemplateResponse(
            request,
            "og_preview.html",
            {
                "product": product,
                "site_base_url": settings.SITE_BASE_URL,
            },
        )

    # Non-crawler request: in local dev the frontend runs separately on :5180,
    # so redirect there. In production the built SPA's dist/index.html would
    # instead be served directly from this same origin (no redirect needed) —
    # that integration is out of scope for local dev and not built here.
    return RedirectResponse(url=f"http://localhost:5180/product/{product_id}")
