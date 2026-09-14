from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings as app_settings
from app.routers import (
    auth,
    hero_slides,
    products,
    settings,
    social_preview,
    uploads,
)

app = FastAPI(title="Casa Lilly API")

# Always allow local dev, plus whatever the deployed frontend's origin is
# (FRONTEND_URL) — set that in production so the real Vercel domain isn't
# blocked by CORS. Vercel also spins up a throwaway preview URL
# (https://<project>-<hash>-<team-slug>.vercel.app) for every deployment, so
# we additionally match any preview URL under our own Vercel team via regex
# — scoped to our team slug (not just *.vercel.app) so this doesn't grant
# CORS to arbitrary other people's Vercel-hosted sites — otherwise CORS
# would otherwise break again on every single deploy.
_allowed_origins = {"http://localhost:5180", app_settings.FRONTEND_URL}
_vercel_preview_regex = r"^https://.*-irfaans-projects\.vercel\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_allowed_origins),
    allow_origin_regex=_vercel_preview_regex,
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
