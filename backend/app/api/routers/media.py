from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.schemas.media import MediaDetail, SearchResult, MediaType, MediaStatus, MediaFormat
from app.services.anilist import anilist_service

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/search", response_model=SearchResult)
async def search(
    q: Optional[str] = Query(None, description="Nombre o término de búsqueda"),
    type: Optional[MediaType] = Query(None, description="ANIME o MANGA"),
    genre: Optional[str] = Query(None, description="Género (Acción, Romance, etc.)"),
    year: Optional[int] = Query(None, ge=1960, le=2030),
    status: Optional[MediaStatus] = Query(None),
    format: Optional[MediaFormat] = Query(None),
    min_score: Optional[int] = Query(None, ge=0, le=100),
    country: Optional[str] = Query(None, description="JP, KR, CN — útil para manhwa/manhua"),
    page: int = Query(1, ge=1),
    per_page: int = Query(24, ge=1, le=50),
):
    """
    Busca anime, manga o manhwa con filtros avanzados.
    Sin `type` devuelve resultados mixtos ordenados por popularidad.
    """
    try:
        return await anilist_service.search(
            query=q,
            media_type=type.value if type else None,
            genre=genre,
            year=year,
            status=status.value if status else None,
            format=format.value if format else None,
            min_score=min_score,
            country=country,
            page=page,
            per_page=per_page,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trending", response_model=SearchResult)
async def trending_anime(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
):
    """Anime actualmente en tendencia (en emisión)."""
    try:
        return await anilist_service.get_trending_anime(page, per_page)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/popular-manga", response_model=SearchResult)
async def popular_manga(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
):
    """Manga/manhwa más popular."""
    try:
        return await anilist_service.get_popular_manga(page, per_page)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/season", response_model=SearchResult)
async def season_anime(
    season: str = Query(..., description="WINTER | SPRING | SUMMER | FALL"),
    year: int = Query(..., ge=1990, le=2030),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=50),
):
    """Anime de una temporada específica."""
    try:
        return await anilist_service.get_season_anime(season, year, page, per_page)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations", response_model=SearchResult)
async def recommendations(
    genre: str = Query(..., description="Género principal (ej. Action, Romance)"),
    type: Optional[str] = Query("ANIME", description="ANIME o MANGA"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=30),
):
    """Media popular filtrada por género — usada para recomendaciones personalizadas."""
    try:
        return await anilist_service.get_recommendations(
            genre=genre,
            media_type=type or "ANIME",
            page=page,
            per_page=per_page,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{media_id}", response_model=MediaDetail)
async def get_media(
    media_id: int,
    type: Optional[MediaType] = Query(None, description="Indicar ANIME o MANGA para mayor precisión"),
):
    """
    Ficha completa de una obra: sinopsis, stats, links de streaming, obras relacionadas.
    """
    try:
        return await anilist_service.get_detail(
            media_id,
            media_type=type.value if type else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
