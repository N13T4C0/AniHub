from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.user_list import UserListEntry
from app.models.review import Review
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/profile", tags=["profile"])


# ── Schemas ────────────────────────────────────────────

class StatusCounts(BaseModel):
    watching: int = 0
    completed: int = 0
    plan_to_watch: int = 0
    dropped: int = 0
    on_hold: int = 0


class ListStats(BaseModel):
    total_anime: int
    total_manga: int
    by_status: StatusCounts
    avg_score: Optional[float]
    scored_entries: int


class ProfileStats(BaseModel):
    user_id: int
    username: str
    email: str
    list_stats: ListStats
    review_count: int


# ── Endpoint ───────────────────────────────────────────

@router.get("/stats", response_model=ProfileStats)
async def get_profile_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Estadísticas completas del perfil del usuario autenticado."""

    # Conteo por tipo de medio
    anime_count = await db.execute(
        select(func.count()).select_from(UserListEntry).where(
            and_(UserListEntry.user_id == current_user.id,
                 UserListEntry.media_type == "ANIME")
        )
    )
    manga_count = await db.execute(
        select(func.count()).select_from(UserListEntry).where(
            and_(UserListEntry.user_id == current_user.id,
                 UserListEntry.media_type == "MANGA")
        )
    )

    # Conteo por estado
    status_rows = await db.execute(
        select(UserListEntry.status, func.count().label("n"))
        .where(UserListEntry.user_id == current_user.id)
        .group_by(UserListEntry.status)
    )
    status_map: dict[str, int] = {row.status: row.n for row in status_rows}

    # Puntuación media (de la lista)
    avg_row = await db.execute(
        select(func.avg(UserListEntry.score), func.count())
        .where(
            and_(
                UserListEntry.user_id == current_user.id,
                UserListEntry.score.isnot(None),
            )
        )
    )
    avg_score_raw, scored_count = avg_row.one()

    # Número total de reseñas
    review_row = await db.execute(
        select(func.count()).select_from(Review).where(
            Review.user_id == current_user.id
        )
    )

    return ProfileStats(
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        list_stats=ListStats(
            total_anime=anime_count.scalar_one(),
            total_manga=manga_count.scalar_one(),
            by_status=StatusCounts(
                watching=status_map.get("watching", 0),
                completed=status_map.get("completed", 0),
                plan_to_watch=status_map.get("plan_to_watch", 0),
                dropped=status_map.get("dropped", 0),
                on_hold=status_map.get("on_hold", 0),
            ),
            avg_score=round(float(avg_score_raw), 2) if avg_score_raw else None,
            scored_entries=scored_count or 0,
        ),
        review_count=review_row.scalar_one(),
    )


@router.get("/reviews", response_model=list)
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lista las propias reseñas del usuario (generales, sin las de episodio)."""
    rows = await db.execute(
        select(Review)
        .where(
            and_(
                Review.user_id == current_user.id,
                Review.episode.is_(None),
            )
        )
        .order_by(Review.created_at.desc())
        .limit(20)
    )
    reviews = rows.scalars().all()
    return [
        {
            "id": r.id,
            "media_id": r.media_id,
            "media_type": r.media_type,
            "score": r.score,
            "body": r.body,
            "created_at": r.created_at.isoformat(),
        }
        for r in reviews
    ]


# ── Settings schemas ───────────────────────────────────

class ChangeUsernameRequest(BaseModel):
    new_username: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ── Settings endpoints ─────────────────────────────────

@router.patch("/settings/username")
async def change_username(
    body: ChangeUsernameRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cambia el username del usuario autenticado."""
    from fastapi import HTTPException as _HTTP
    from sqlalchemy import select as _sel

    new_username = body.new_username.strip()
    if len(new_username) < 3 or len(new_username) > 30:
        raise _HTTP(status_code=400, detail="El username debe tener entre 3 y 30 caracteres")

    existing = await db.execute(_sel(User).where(User.username == new_username))
    if existing.scalar_one_or_none():
        raise _HTTP(status_code=409, detail="Ese username ya está en uso")

    current_user.username = new_username
    await db.commit()
    return {"username": new_username}


@router.patch("/settings/password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cambia la contraseña del usuario autenticado."""
    from fastapi import HTTPException as _HTTP
    from app.core.security import verify_password as _verify, hash_password as _hash

    if not _verify(body.current_password, current_user.password_hash):
        raise _HTTP(status_code=400, detail="La contraseña actual no es correcta")

    if len(body.new_password) < 6:
        raise _HTTP(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")

    current_user.password_hash = _hash(body.new_password)
    await db.commit()
    return {"detail": "Contraseña actualizada correctamente"}


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elimina permanentemente la cuenta del usuario autenticado."""
    await db.delete(current_user)
    await db.commit()
    return {"detail": "Cuenta eliminada"}


@router.get("/top-genres")
async def get_top_genres(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Devuelve los géneros más frecuentes en la lista del usuario."""
    from app.services.anilist import anilist_service as _anilist

    rows = await db.execute(
        select(UserListEntry.media_id)
        .where(
            and_(
                UserListEntry.user_id == current_user.id,
                UserListEntry.status.in_(["watching", "completed"]),
            )
        )
        .limit(30)
    )
    ids = [r.media_id for r in rows]
    if not ids:
        return {"genres": []}

    try:
        genres = await _anilist.get_genres_for_ids(ids)
    except Exception:
        genres = []

    return {"genres": genres[:5]}
