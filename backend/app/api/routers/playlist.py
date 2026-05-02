"""
Generador de playlists de anime personalizadas.
POST /api/v1/playlist/generate
"""
import random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.anilist import anilist_service, PLAYLIST_QUERY
from app.schemas.media import SearchResult

router = APIRouter(prefix="/playlist", tags=["playlist"])

# ── Config maps ────────────────────────────────────────────────

VIBE_GENRES: dict[str, list[str]] = {
    "chill":    ["Slice of Life", "Comedy", "Music"],
    "intense":  ["Action", "Thriller", "Sports"],
    "emotional":["Drama", "Romance", "Tragedy"],
    "funny":    ["Comedy", "Parody", "Gag Humor"],
    "dark":     ["Psychological", "Horror", "Mystery"],
    "epic":     ["Adventure", "Fantasy", "Sci-Fi"],
}

TYPE_GENRES: dict[str, list[str]] = {
    "mainstream": ["Action", "Adventure"],
    "niche":      ["Iyashikei", "Josei", "Avant Garde"],
    "adventure":  ["Adventure", "Fantasy"],
    "romance":    ["Romance", "Drama"],
    "shonen":     ["Action", "Adventure", "Sports"],
    "seinen":     ["Psychological", "Drama", "Thriller"],
    "isekai":     ["Fantasy", "Adventure", "Action"],
    "mecha":      ["Mecha", "Sci-Fi", "Action"],
    "horror":     ["Horror", "Supernatural", "Thriller"],
    "sports":     ["Sports", "Drama"],
}

LENGTH_FILTERS: dict[str, dict] = {
    "short":  {"format": "TV", "episodes_lte": 13},
    "medium": {"format": "TV", "episodes_gte": 13, "episodes_lte": 26},
    "long":   {"format": "TV", "episodes_gte": 26},
    "movie":  {"format": "MOVIE"},
    "any":    {},
}

ERA_RANGES: dict[str, tuple[Optional[int], Optional[int]]] = {
    "classic": (None,   20001231),
    "2000s":   (20000101, 20091231),
    "2010s":   (20100101, 20191231),
    "recent":  (20200101, None),
    "any":     (None, None),
}

SORT_MAP: dict[str, list[str]] = {
    "mainstream": ["POPULARITY_DESC"],
    "niche":      ["SCORE_DESC", "FAVOURITES_DESC"],
    "any":        ["TRENDING_DESC"],
}

# ── Schemas ────────────────────────────────────────────────────

class PlaylistRequest(BaseModel):
    vibe: str = "epic"          # chill | intense | emotional | funny | dark | epic
    playlist_type: str = "mainstream"  # mainstream | niche | adventure | romance | shonen | seinen | isekai | mecha | horror | sports
    length: str = "any"         # short | medium | long | movie | any
    era: str = "any"            # classic | 2000s | 2010s | recent | any
    count: int = 8              # 5–12

class PlaylistItem(BaseModel):
    id: int
    title: str
    cover: Optional[str]
    score: Optional[int]
    episodes: Optional[int]
    genres: list[str]
    description: Optional[str]
    reason: str  # why it was picked

class PlaylistResponse(BaseModel):
    items: list[PlaylistItem]
    vibe: str
    playlist_type: str
    title: str

# ── Endpoint ───────────────────────────────────────────────────

@router.post("/generate", response_model=PlaylistResponse)
async def generate_playlist(req: PlaylistRequest):
    count = max(5, min(12, req.count))

    vibe_genres  = VIBE_GENRES.get(req.vibe, ["Action", "Adventure"])
    type_genres  = TYPE_GENRES.get(req.playlist_type, ["Action"])
    length_cfg   = LENGTH_FILTERS.get(req.length, {})
    era_start, era_end = ERA_RANGES.get(req.era, (None, None))
    sort = SORT_MAP.get(req.playlist_type, ["TRENDING_DESC"])

    genre1 = vibe_genres[0]
    genre2 = type_genres[0]

    try:
        data = await anilist_service._gql(PLAYLIST_QUERY, {
            "genre": genre1,
            "genre2": genre2,
            "format": length_cfg.get("format"),
            "status": None,
            "yearGreater": era_start,
            "yearLesser": era_end,
            "sort": sort,
            "page": 1,
            "perPage": 50,
        })
    except Exception as e:
        raise HTTPException(500, f"Error al consultar AniList: {e}")

    raw_items = data.get("Page", {}).get("media", [])
    if not raw_items:
        # Fallback — broader search
        try:
            data2 = await anilist_service._gql(PLAYLIST_QUERY, {
                "genre": genre1, "genre2": None, "format": None,
                "status": None, "yearGreater": None, "yearLesser": None,
                "sort": ["POPULARITY_DESC"], "page": 1, "perPage": 50,
            })
            raw_items = data2.get("Page", {}).get("media", [])
        except Exception:
            raw_items = []

    # Shuffle and deduplicate
    random.shuffle(raw_items)
    seen_ids: set[int] = set()
    unique = []
    for item in raw_items:
        if item["id"] not in seen_ids:
            seen_ids.add(item["id"])
            unique.append(item)

    selected = unique[:count]

    REASON_TEMPLATES = {
        "chill":     "Perfecta para relajarse",
        "intense":   "Llena de adrenalina y acción",
        "emotional": "Te tocará el corazón",
        "funny":     "Garantizada para hacerte reír",
        "dark":      "Oscura y psicológicamente fascinante",
        "epic":      "Una aventura épica que no olvidarás",
    }
    NICHE_REASONS = {
        "niche":    "Joya poco conocida que sorprende",
        "isekai":   "Clásico del género isekai",
        "mecha":    "Referente del género mecha",
        "romance":  "Historia de amor que engancha",
        "shonen":   "Motivadora y llena de energía",
        "seinen":   "Madura y profunda",
        "horror":   "Escalofriante y perturbadora",
        "sports":   "Inspiradora y emocionante",
        "adventure":"Aventura llena de descubrimientos",
    }

    base_reason = REASON_TEMPLATES.get(req.vibe, "Recomendada para tu perfil")
    type_reason = NICHE_REASONS.get(req.playlist_type, "")

    items = []
    for m in selected:
        title = (m.get("title") or {})
        title_str = title.get("english") or title.get("romaji") or title.get("userPreferred") or "?"
        cover = (m.get("coverImage") or {}).get("large") or (m.get("coverImage") or {}).get("medium")
        reason = base_reason
        if type_reason and random.random() > 0.5:
            reason = type_reason
        items.append(PlaylistItem(
            id=m["id"],
            title=title_str,
            cover=cover,
            score=m.get("averageScore"),
            episodes=m.get("episodes"),
            genres=(m.get("genres") or [])[:4],
            description=(m.get("description") or "")[:200] if m.get("description") else None,
            reason=reason,
        ))

    PLAYLIST_TITLES = {
        ("chill",     "mainstream"): "Una tarde tranquila",
        ("chill",     "niche"):      "Joyas del iyashikei",
        ("intense",   "shonen"):     "La adrenalina del shonen",
        ("intense",   "mainstream"): "Acción sin parar",
        ("emotional", "romance"):    "Para llorar en el sofá",
        ("emotional", "seinen"):     "Dramas que te marcan",
        ("funny",     "mainstream"): "Carcajadas garantizadas",
        ("dark",      "seinen"):     "El lado oscuro del anime",
        ("dark",      "horror"):     "Noches de terror",
        ("epic",      "isekai"):     "Mundos paralelos",
        ("epic",      "adventure"):  "La gran aventura",
        ("epic",      "mecha"):      "Robots y batallas épicas",
    }
    playlist_title = PLAYLIST_TITLES.get(
        (req.vibe, req.playlist_type),
        f"Tu playlist {req.vibe}"
    )

    return PlaylistResponse(items=items, vibe=req.vibe, playlist_type=req.playlist_type, title=playlist_title)
