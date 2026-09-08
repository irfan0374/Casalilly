from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    hero_slides,
    products,
    settings,
    social_preview,
    uploads,
)

app = FastAPI(title="Casa Lilly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5180"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.public_router)
app.include_router(products.admin_router)
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(settings.public_router)
app.include_router(settings.admin_router)
app.include_router(hero_slides.public_router)
app.include_router(hero_slides.admin_router)
app.include_router(social_preview.router)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
