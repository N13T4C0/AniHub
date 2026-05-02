"""
Schemas Pydantic para el contenido de AniHub.
Cubre Anime, Manga y Manhwa bajo el concepto unificado de "Media".
"""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class MediaType(str, Enum):
    ANIME = "ANIME"
    MANGA = "MANGA"


class MediaFormat(str, Enum):
    # Anime
    TV = "TV"
    TV_SHORT = "TV_SHORT"
    MOVIE = "MOVIE"
    SPECIAL = "SPECIAL"
    OVA = "OVA"
    ONA = "ONA"
    MUSIC = "MUSIC"
    # Manga / Manhwa / Manhua
    MANGA = "MANGA"
    NOVEL = "NOVEL"
    ONE_SHOT = "ONE_SHOT"


class MediaStatus(str, Enum):
    FINISHED = "FINISHED"
    RELEASING = "RELEASING"
    NOT_YET_RELEASED = "NOT_YET_RELEASED"
    CANCELLED = "CANCELLED"
    HIATUS = "HIATUS"


class MediaSource(str, Enum):
    ORIGINAL = "ORIGINAL"
    MANGA = "MANGA"
    LIGHT_NOVEL = "LIGHT_NOVEL"
    VISUAL_NOVEL = "VISUAL_NOVEL"
    VIDEO_GAME = "VIDEO_GAME"
    OTHER = "OTHER"
    NOVEL = "NOVEL"
    DOUJINSHI = "DOUJINSHI"
    ANIME = "ANIME"
    WEB_NOVEL = "WEB_NOVEL"
    LIVE_ACTION = "LIVE_ACTION"
    GAME = "GAME"
    COMIC = "COMIC"
    MULTIMEDIA_PROJECT = "MULTIMEDIA_PROJECT"


class MediaTitle(BaseModel):
    romaji: Optional[str] = None
    english: Optional[str] = None
    native: Optional[str] = None
    user_preferred: Optional[str] = None


class CoverImage(BaseModel):
    extra_large: Optional[str] = None
    large: Optional[str] = None
    medium: Optional[str] = None
    color: Optional[str] = None


class StreamingLink(BaseModel):
    platform: str
    url: str
    is_legal: bool = True
    region: Optional[str] = None



class CharacterName(BaseModel):
    full: Optional[str] = None
    native: Optional[str] = None
    user_preferred: Optional[str] = None


class CharacterImage(BaseModel):
    large: Optional[str] = None
    medium: Optional[str] = None


class VoiceActor(BaseModel):
    id: int
    name: Optional[str] = None
    image: Optional[str] = None


class Character(BaseModel):
    id: int
    name: Optional[CharacterName] = None
    image: Optional[CharacterImage] = None
    role: str = "SUPPORTING"  # MAIN | SUPPORTING | BACKGROUND
    gender: Optional[str] = None
    description: Optional[str] = None
    voice_actors: List[VoiceActor] = []


class MediaBase(BaseModel):
    """Campos mínimos para mostrar en grids y resultados de búsqueda."""
    id: int
    media_type: MediaType
    title: MediaTitle
    cover_image: Optional[CoverImage] = None
    banner_image: Optional[str] = None
    average_score: Optional[int] = None       # 0–100
    status: Optional[MediaStatus] = None
    format: Optional[MediaFormat] = None
    genres: List[str] = []
    season: Optional[str] = None
    season_year: Optional[int] = None
    # Anime
    episodes: Optional[int] = None
    # Manga / Manhwa
    chapters: Optional[int] = None
    volumes: Optional[int] = None
    is_adult: bool = False


class MediaDetail(MediaBase):
    """Todos los detalles para la ficha de serie."""
    description: Optional[str] = None
    duration: Optional[int] = None            # mins por episodio (anime)
    source: Optional[str] = None
    synonyms: List[str] = []
    studios: List[str] = []                   # solo anime
    staff: List[str] = []                     # autores para manga
    trailer_url: Optional[str] = None
    site_url: Optional[str] = None
    popularity: Optional[int] = None
    favourites: Optional[int] = None
    country_of_origin: Optional[str] = None   # JP, KR, CN...
    streaming_links: List[StreamingLink] = []
    related_media: List[MediaBase] = []
    external_links: List[dict] = []
    characters: List[Character] = []


class SearchResult(BaseModel):
    """Respuesta paginada de búsqueda."""
    page: int
    per_page: int
    total: int
    has_next_page: bool
    items: List[MediaBase]


class SearchParams(BaseModel):
    """Parámetros de búsqueda admitidos."""
    query: Optional[str] = None
    media_type: Optional[MediaType] = None
    genre: Optional[str] = None
    year: Optional[int] = None
    status: Optional[MediaStatus] = None
    format: Optional[MediaFormat] = None
    min_score: Optional[int] = None
    country: Optional[str] = None             # JP, KR, CN para manhwa/manhua
    page: int = 1
    per_page: int = 24
