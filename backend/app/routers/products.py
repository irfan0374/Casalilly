from typing import List, Optional, Set, Tuple

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps import get_current_admin, get_db
from app.models.admin import Admin
from app.models.product import Product
from app.models.occasion import Occasion
from app.schemas.product import (
    CATEGORIES,
    CatalogSummary,
    ProductCreate,
    ProductOut,
    ProductUpdate,
)
from app.services.cloudinary_service import destroy_assets, public_id_from_url

public_router = APIRouter(prefix="/api", tags=["products"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-products"])

# Each media URL column paired with the column holding its Cloudinary public id.
_MEDIA_FIELDS = [
    ("image_url", "image_public_id"),
    ("extra_image_urls", "extra_image_public_ids"),
    ("video_url", "video_public_id"),
]


def _resolve_occasions(ids: List[int], db: Session) -> List[Occasion]:
    unique_ids = set(ids)
    occasions = db.query(Occasion).filter(Occasion.id.in_(unique_ids)).all() if unique_ids else []
    if len(occasions) != len(unique_ids):
        raise HTTPException(status_code=422, detail="An occasion no longer exists. Reload the occasion choices.")
    return occasions


def _product_assets(product: Product) -> Set[Tuple[str, str]]:
    """Every Cloudinary asset this product currently points at, as
    (public_id, resource_type). Falls back to deriving the id from the URL
    for rows saved before public ids were tracked."""
    assets: Set[Tuple[str, str]] = set()

    def add(url: Optional[str], public_id: Optional[str], resource_type: str) -> None:
        resolved = public_id or public_id_from_url(url)
        if resolved:
            assets.add((resolved, resource_type))

    add(product.image_url, product.image_public_id, "image")
    extra_ids = product.extra_image_public_ids or []
    for i, url in enumerate(product.extra_image_urls or []):
        add(url, extra_ids[i] if i < len(extra_ids) else None, "image")
    add(product.video_url, product.video_public_id, "video")
    return assets


@public_router.get("/categories", response_model=List[str])
def list_categories() -> List[str]:
    return CATEGORIES


@public_router.get("/products", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    occasion: Optional[int] = Query(None, ge=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[Product]:
    query = db.query(Product).filter(Product.is_active.is_(True))
    if category is not None:
        query = query.filter(Product.categories.any(category))
    if occasion is not None:
        query = query.filter(Product.occasions.any((Occasion.id == occasion) & Occasion.is_active.is_(True)))
    if featured is not None:
        query = query.filter(Product.is_featured.is_(featured))
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (Product.name.ilike(pattern)) | (Product.description.ilike(pattern))
        )
    return (
        query.order_by(Product.created_at.desc(), Product.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# Declared before /products/{product_id} so "summary" isn't parsed as an id.
@public_router.get("/products/summary", response_model=CatalogSummary)
def catalog_summary(db: Session = Depends(get_db)) -> CatalogSummary:
    """Totals for the homepage, computed in the database rather than by
    downloading the (capped) product list and counting it client-side."""
    total = (
        db.query(func.count(Product.id)).filter(Product.is_active.is_(True)).scalar() or 0
    )
    used = {
        row[0]
        for row in db.query(func.unnest(Product.categories))
        .filter(Product.is_active.is_(True))
        .distinct()
        .all()
    }
    return CatalogSummary(
        total_products=total,
        categories_with_products=[c for c in CATEGORIES if c in used],
    )


@public_router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.is_active.is_(True))
        .first()
    )
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@admin_router.get("/products", response_model=List[ProductOut])
def admin_list_products(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> List[Product]:
    query = db.query(Product)
    if category is not None:
        query = query.filter(Product.categories.any(category))
    return query.order_by(Product.created_at.desc()).all()


@admin_router.get("/products/{product_id}", response_model=ProductOut)
def admin_get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@admin_router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Product:
    values = payload.model_dump()
    occasions = _resolve_occasions(values.pop("occasion_ids"), db)
    product = Product(**values, occasions=occasions)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@admin_router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    assets_before = _product_assets(product)
    changes = payload.model_dump(exclude_unset=True)
    if "occasion_ids" in changes:
        ids = changes.pop("occasion_ids")
        if ids is None:
            raise HTTPException(status_code=422, detail="Occasions must be a list")
        product.occasions = _resolve_occasions(ids, db)
    # A new URL sent without its public id must not keep the old file's id
    # — that would point the id at the wrong asset and leak the new one.
    for url_field, id_field in _MEDIA_FIELDS:
        if url_field in changes and id_field not in changes:
            changes[id_field] = None
    for field, value in changes.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    background_tasks.add_task(destroy_assets, assets_before - _product_assets(product))
    return product


@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    assets = _product_assets(product)
    db.delete(product)
    db.commit()
    background_tasks.add_task(destroy_assets, assets)
