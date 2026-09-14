from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    WHATSAPP_NUMBER: str
    SITE_BASE_URL: str
    # Deployed frontend origin (e.g. https://casalilly.vercel.app) — used for
    # CORS and for redirecting real visitors away from the backend's
    # crawler-facing /product/{id} route. Defaults to the local Vite dev
    # server so nothing extra is needed for local development.
    FRONTEND_URL: str = "http://localhost:5180"
    ADMIN_SEED_USERNAME: str
    ADMIN_SEED_PASSWORD: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
