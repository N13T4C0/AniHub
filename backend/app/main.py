from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
import app.models  # noqa: F401 — registra todos los modelos en Base.metadata
from app.api.routers import media, auth, list, review, profile, forum, playlist


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas al iniciar (SQLite las crea automáticamente)
    await init_db()
    # Seed forum categories
    from app.core.database import AsyncSessionLocal
    from app.api.routers.forum import seed_categories
    async with AsyncSessionLocal() as db:
        await seed_categories(db)
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} — {settings.ENVIRONMENT}")
    yield
    print("⏹️  Servidor detenido.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API de AniHub — anime, manga y manhwa en un solo lugar.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(media.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(list.router, prefix="/api/v1")
app.include_router(review.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(forum.router, prefix="/api/v1")
app.include_router(playlist.router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health():    return {"status": "ok", "version": settings.APP_VERSION}
