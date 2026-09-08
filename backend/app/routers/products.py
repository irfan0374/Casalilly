from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_admin, get_db
from app.models.admin import Admin
from app.models.product import Product
from app.schemas.product import CATEGORIES, ProductCreate, ProductOut, ProductUpdate

public_router = APIRouter(prefix="/api", tags=["products"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-products"])


@public_router.get("/categories", response_model=List[str])
def list_categories() -> List[str]:
    return CATEGORIES


@public_router.get("/products", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    db: Session = Depends(get_db),
) -> List[Product]:
    query = db.query(Product).filter(Product.is_active.is_(True))
    if category is not None:
        query = query.filter(Product.category == category)
    if featured is not None:
        query = query.filter(Product.is_featured.is_(featured))
    return query.order_by(Product.created_at.desc()).all()


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
        query = query.filter(Product.category == category)
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
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@admin_router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
) -> None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.delete(product)
    db.commit()
