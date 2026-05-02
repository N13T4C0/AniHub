"""
Servicio para la API GraphQL de AniList.
Cubre ANIME y MANGA (incluye manhwa/manhua por país de origen).
Docs: https://anilist.gitbook.io/anilist-apiv2-docs/
"""
import httpx
from typing import Optional
from app.core.config import settings
from app.schemas.media import (
    MediaBase, MediaDetail, SearchResult, StreamingLink,
    MediaType, CoverImage, MediaTitle,
)

# ── Queries GraphQL ────────────────────────────────────

_MEDIA_FIELDS_BASE = """
  id
  type
  title { romaji english native userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  averageScore
  status
  format
  genres
  season
  seasonYear
  episodes
  chapters
  volumes
  isAdult
  countryOfOrigin
"""

SEARCH_QUERY = """
query (
  $search: String, $type: MediaType, $genre: String,
  $year: Int, $status: MediaStatus, $format: MediaFormat,
  $minScore: Int, $country: CountryCode,
  $page: Int, $perPage: Int
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage hasNextPage }
    media(
      search: $search
      type: $type
      genre: $genre
      seasonYear: $year
      status: $status
      format: $format
      averageScore_greater: $minScore
      countryOfOrigin: $country
      sort: [POPULARITY_DESC]
      isAdult: false
    ) {
""" + _MEDIA_FIELDS_BASE + """
    }
  }
}
"""

SEASON_QUERY = """
query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total hasNextPage }
    media(type: ANIME, season: $season, seasonYear: $year, sort: [POPULARITY_DESC], isAdult: false) {
""" + _MEDIA_FIELDS_BASE + """
    }
  }
}
"""

TRENDING_ANIME_QUERY = """
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total hasNextPage }
    media(type: ANIME, sort: [TRENDING_DESC], status: RELEASING, isAdult: false) {
""" + _MEDIA_FIELDS_BASE + """
    }
  }
}
"""

POPULAR_MANGA_QUERY = """
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total hasNextPage }
    media(type: MANGA, sort: [POPULARITY_DESC], isAdult: false) {
""" + _MEDIA_FIELDS_BASE + """
    }
  }
}
"""

DETAIL_QUERY = """
query ($id: Int, $type: MediaType) {
  Media(id: $id, type: $type) {
""" + _MEDIA_FIELDS_BASE + """
    description(asHtml: false)
    duration
    source
    synonyms
    siteUrl
    popularity
    favourites
    countryOfOrigin
    trailer { id site thumbnail }
    studios(isMain: true) { nodes { name } }
    staff(sort: [RELEVANCE], page: 1, perPage: 4) {
      nodes { name { full } primaryOccupations }
    }
    externalLinks { url site type language }
    characters(sort: [ROLE, RELEVANCE], perPage: 20) {
      edges {
        role
        node {
          id
          name { full native userPreferred }
          image { large medium }
          gender
          description(asHtml: false)
        }
        voiceActors(language: JAPANESE) {
          id
          name { full }
          image { large medium }
          language
        }
      }
    }
    relations {
      edges {
        relationType(version: 2)
        node {
""" + _MEDIA_FIELDS_BASE + """
        }
      }
    }
  }
}
"""


# ── Helpers ────────────────────────────────────────────

def _parse_base(media: dict) -> MediaBase:
    raw_type = media.get("type", "ANIME")
    return MediaBase(
        id=media["id"],
        media_type=MediaType(raw_type),
        title=MediaTitle(
            romaji=media["title"].get("romaji"),
            english=media["title"].get("english"),
            native=media["title"].get("native"),
            user_preferred=media["title"].get("userPreferred"),
        ),
        cover_image=CoverImage(
            extra_large=media.get("coverImage", {}).get("extraLarge"),
            large=media.get("coverImage", {}).get("large"),
            medium=media.get("coverImage", {}).get("medium"),
            color=media.get("coverImage", {}).get("color"),
        ) if media.get("coverImage") else None,
        banner_image=media.get("bannerImage"),
        average_score=media.get("averageScore"),
        status=media.get("status"),
        format=media.get("format"),
        genres=media.get("genres", []),
        season=media.get("season"),
        season_year=media.get("seasonYear"),
        episodes=media.get("episodes"),
        chapters=media.get("chapters"),
        volumes=media.get("volumes"),
        is_adult=media.get("isAdult", False),
        country_of_origin=media.get("countryOfOrigin"),
    )


def _trailer_url(trailer: Optional[dict]) -> Optional[str]:
    if not trailer:
        return None
    if trailer.get("site") == "youtube":
        return f"https://www.youtube.com/watch?v={trailer['id']}"
    return None


def _streaming_links(media_id: int, title: dict, media_type: str) -> list[StreamingLink]:
    """
    Genera links de streaming/lectura conocidos.
    Combina links oficiales (de AniList) con búsquedas en plataformas populares.
    """
    q = (title.get("english") or title.get("romaji") or "").replace(" ", "+")
    links = []

    if media_type == "ANIME":
        links += [
            StreamingLink(platform="Crunchyroll", url=f"https://www.crunchyroll.com/search?q={q}", is_legal=True),
            StreamingLink(platform="Funimation", url=f"https://www.funimation.com/search/?q={q}", is_legal=True),
            StreamingLink(platform="Netflix", url=f"https://www.netflix.com/search?q={q}", is_legal=True),
            StreamingLink(platform="Amazon Prime", url=f"https://www.primevideo.com/search/ref=atv_nb_srd?phrase={q}", is_legal=True),
            # Alternativas con disclaimer
            StreamingLink(platform="Gogoanime", url=f"https://gogoanime3.co/search.html?keyword={q}", is_legal=False),
            StreamingLink(platform="Zoro.to", url=f"https://zoro.to/search?keyword={q}", is_legal=False),
        ]
    else:  # MANGA / MANHWA
        links += [
            StreamingLink(platform="MangaPlus", url=f"https://mangaplus.shueisha.co.jp/search_result?keyword={q}", is_legal=True),
            StreamingLink(platform="Viz Media", url=f"https://www.viz.com/search?search={q}", is_legal=True),
            # Alternativas
            StreamingLink(platform="MangaDex", url=f"https://mangadex.org/search?q={q}", is_legal=False),
            StreamingLink(platform="MangaKakalot", url=f"https://mangakakalot.com/search/story/{q.lower().replace('+', '_')}", is_legal=False),
        ]

    # Siempre incluir AniList como referencia
    links.append(StreamingLink(platform="AniList", url=f"https://anilist.co/{media_type.lower()}/{media_id}", is_legal=True))

    return links


# ── Cliente ────────────────────────────────────────────

RECOMMENDATIONS_QUERY = """
query ($genre: String, $type: MediaType, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: $type, genre: $genre, sort: [POPULARITY_DESC], isAdult: false) {
      %s
    }
  }
}
""" % _MEDIA_FIELDS_BASE

class AniListService:

    def __init__(self):
        self.url = settings.ANILIST_API_URL
        self.headers = {"Content-Type": "application/json", "Accept": "application/json"}

    async def _gql(self, query: str, variables: dict) -> dict:
        clean_vars = {k: v for k, v in variables.items() if v is not None}
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(self.url, json={"query": query, "variables": clean_vars}, headers=self.headers)
            r.raise_for_status()
            data = r.json()
            if "errors" in data:
                raise ValueError(f"AniList error: {data['errors'][0]['message']}")
            return data["data"]

    async def search(
        self,
        query: Optional[str] = None,
        media_type: Optional[str] = None,
        genre: Optional[str] = None,
        year: Optional[int] = None,
        status: Optional[str] = None,
        format: Optional[str] = None,
        min_score: Optional[int] = None,
        country: Optional[str] = None,
        page: int = 1,
        per_page: int = 24,
    ) -> SearchResult:
        data = await self._gql(SEARCH_QUERY, {
            "search": query, "type": media_type, "genre": genre,
            "year": year, "status": status, "format": format,
            "minScore": min_score, "country": country,
            "page": page, "perPage": per_page,
        })
        p = data["Page"]
        return SearchResult(
            page=p["pageInfo"]["currentPage"],
            per_page=per_page,
            total=p["pageInfo"]["total"],
            has_next_page=p["pageInfo"]["hasNextPage"],
            items=[_parse_base(m) for m in p["media"]],
        )

    async def get_detail(self, media_id: int, media_type: Optional[str] = None) -> MediaDetail:
        data = await self._gql(DETAIL_QUERY, {"id": media_id, "type": media_type})
        m = data["Media"]

        studios = [s["name"] for s in m.get("studios", {}).get("nodes", [])]
        staff = [
            f"{s['name']['full']} ({', '.join(s['primaryOccupations'][:1])})"
            for s in m.get("staff", {}).get("nodes", [])
            if s.get("name") and s.get("primaryOccupations")
        ]

        related = []
        for edge in m.get("relations", {}).get("edges", []):
            node = edge.get("node", {})
            if node.get("format") not in ["NOVEL", "MUSIC"]:
                related.append(_parse_base(node))

        ext_links = [
            {"platform": l["site"], "url": l["url"], "type": l.get("type"), "language": l.get("language")}
            for l in m.get("externalLinks", [])
            if l.get("url") and l.get("site")
        ]

        base = _parse_base(m)
        streaming = _streaming_links(m["id"], m["title"], m.get("type", "ANIME"))

        # Parse characters
        from app.schemas.media import Character, CharacterName, CharacterImage, VoiceActor
        characters = []
        for edge in m.get("characters", {}).get("edges", []):
            node = edge.get("node", {})
            if not node:
                continue
            va_list = []
            for va in edge.get("voiceActors", []):
                va_list.append(VoiceActor(
                    id=va["id"],
                    name=va.get("name", {}).get("full"),
                    image=va.get("image", {}).get("large"),
                ))
            characters.append(Character(
                id=node["id"],
                name=CharacterName(
                    full=node.get("name", {}).get("full"),
                    native=node.get("name", {}).get("native"),
                    user_preferred=node.get("name", {}).get("userPreferred"),
                ),
                image=CharacterImage(
                    large=node.get("image", {}).get("large"),
                    medium=node.get("image", {}).get("medium"),
                ),
                role=edge.get("role", "SUPPORTING"),
                gender=node.get("gender"),
                description=node.get("description"),
                voice_actors=va_list,
            ))

        return MediaDetail(
            **base.model_dump(),
            description=m.get("description"),
            duration=m.get("duration"),
            source=m.get("source"),
            synonyms=m.get("synonyms", []),
            studios=studios,
            staff=staff,
            trailer_url=_trailer_url(m.get("trailer")),
            site_url=m.get("siteUrl"),
            popularity=m.get("popularity"),
            favourites=m.get("favourites"),
            streaming_links=streaming,
            related_media=related[:8],
            external_links=ext_links,
            characters=characters,
        )

    async def get_trending_anime(self, page: int = 1, per_page: int = 12) -> SearchResult:
        data = await self._gql(TRENDING_ANIME_QUERY, {"page": page, "perPage": per_page})
        p = data["Page"]
        return SearchResult(
            page=page, per_page=per_page,
            total=p["pageInfo"]["total"],
            has_next_page=p["pageInfo"]["hasNextPage"],
            items=[_parse_base(m) for m in p["media"]],
        )

    async def get_popular_manga(self, page: int = 1, per_page: int = 12) -> SearchResult:
        data = await self._gql(POPULAR_MANGA_QUERY, {"page": page, "perPage": per_page})
        p = data["Page"]
        return SearchResult(
            page=page, per_page=per_page,
            total=p["pageInfo"]["total"],
            has_next_page=p["pageInfo"]["hasNextPage"],
            items=[_parse_base(m) for m in p["media"]],
        )

    async def get_season_anime(
        self,
        season: str,
        year: int,
        page: int = 1,
        per_page: int = 30,
    ) -> SearchResult:
        """Anime de una temporada específica. season = WINTER|SPRING|SUMMER|FALL"""
        data = await self._gql(SEASON_QUERY, {
            "season": season.upper(),
            "year": year,
            "page": page,
            "perPage": per_page,
        })
        p = data["Page"]
        return SearchResult(
            page=page, per_page=per_page,
            total=p["pageInfo"]["total"],
            has_next_page=p["pageInfo"]["hasNextPage"],
            items=[_parse_base(m) for m in p["media"]],
        )


    async def get_recommendations(
        self, genre: str, media_type: str = "ANIME", page: int = 1, per_page: int = 12
    ) -> "SearchResult":
        data = await self._gql(RECOMMENDATIONS_QUERY, {
            "genre": genre, "type": media_type, "page": page, "perPage": per_page
        })
        p = data["Page"]
        return SearchResult(
            page=page, per_page=per_page,
            total=p["pageInfo"]["total"],
            has_next_page=p["pageInfo"]["hasNextPage"],
            items=[_parse_base(m) for m in p["media"]],
        )


    async def get_genres_for_ids(self, media_ids: list[int]) -> list[str]:
        """Returns the most common genres across a list of media IDs."""
        if not media_ids:
            return []
        data = await self._gql(GENRES_BY_IDS_QUERY, {"ids": media_ids[:50]})
        from collections import Counter
        counts: Counter = Counter()
        for m in data.get("Page", {}).get("media", []):
            for g in (m.get("genres") or []):
                counts[g] += 1
        # Return top genres (exclude generic ones)
        exclude = {"Ecchi", "Hentai", "Kids"}
        return [g for g, _ in counts.most_common(10) if g not in exclude]


anilist_service = AniListService()

RECOMMENDATIONS_QUERY = """
query ($genre: String, $type: MediaType, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: $type, genre: $genre, sort: [POPULARITY_DESC], isAdult: false) {
      %s
    }
  }
}
""" % _MEDIA_FIELDS_BASE

GENRES_BY_IDS_QUERY = """
query ($ids: [Int]) {
  Page(perPage: 50) {
    media(id_in: $ids) {
      id
      genres
    }
  }
}
"""

PLAYLIST_QUERY = """
query ($genre: String, $genre2: String, $format: MediaFormat, $status: MediaStatus,
       $yearGreater: FuzzyDateInt, $yearLesser: FuzzyDateInt,
       $sort: [MediaSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(
      type: ANIME, isAdult: false,
      genre_in: [$genre, $genre2],
      format: $format, status: $status,
      startDate_greater: $yearGreater,
      startDate_lesser: $yearLesser,
      sort: $sort
    ) {
      id type
      title { romaji english native userPreferred }
      coverImage { extraLarge large medium color }
      bannerImage averageScore status format genres
      season seasonYear episodes chapters volumes isAdult
      countryOfOrigin
      description(asHtml: false)
      popularity
    }
  }
}
"""
