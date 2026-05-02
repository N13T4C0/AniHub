from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewPublic, ReviewList

router = APIRouter(prefix="/reviews", tags=["reviews"])


# ── Helpers ────────────────────────────────────────────

async def _to_public(review: Review, db: AsyncSession) -> ReviewPublic:
    """Convierte un Review ORM a ReviewPublic inyectando el username."""
    result = await db.execute(select(User.username).where(User.id == review.user_id))
    username = result.scalar_one_or_none() or "Desconocido"
    return ReviewPublic(
        id=review.id,
        user_id=review.user_id,
        username=username,
        media_id=review.media_id,
        media_type=review.media_type,
        score=review.score,
        body=review.body,
        episode=review.episode,
        created_at=review.created_at,
    )


# ── Endpoints ──────────────────────────────────────────

@router.get("/{media_type}/{media_id}", response_model=ReviewList)
async def get_reviews(
    media_type: str,
    media_id: int,
    episode: int | None = Query(None, description="Filtrar por episodio/capítulo"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Lista las reseñas de un título. Filtra por episodio si se pasa `episode`."""
    media_type = media_type.upper()
    base_filter = and_(
        Review.media_id == media_id,
        Review.media_type == media_type,
    )
    if episode is not None:
        base_filter = and_(base_filter, Review.episode == episode)
    else:
        base_filter = and_(base_filter, Review.episode.is_(None))

    # Total
    count_q = await db.execute(select(func.count()).select_from(Review).where(base_filter))
    total = count_q.scalar_one()

    # Puntuación media (solo reseñas generales con score)
    avg_q = await db.execute(
        select(func.avg(Review.score)).where(
            and_(
                Review.media_id == media_id,
                Review.media_type == media_type,
                Review.episode.is_(None),
                Review.score.isnot(None),
            )
        )
    )
    raw_avg = avg_q.scalar_one_or_none()
    avg_score = round(float(raw_avg), 2) if raw_avg is not None else None

    # Paginación
    offset = (page - 1) * per_page
    rows = await db.execute(
        select(Review)
        .where(base_filter)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    reviews = rows.scalars().all()
    items = [await _to_public(r, db) for r in reviews]

    return ReviewList(items=items, total=total, avg_score=avg_score)


@router.post("/{media_type}/{media_id}", response_model=ReviewPublic, status_code=201)
async def create_review(
    media_type: str,
    media_id: int,
    body: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Crea o actualiza la reseña del usuario para un título (o episodio)."""
    media_type = media_type.upper()

    # Comprobar si ya existe
    existing = await db.execute(
        select(Review).where(
            and_(
                Review.user_id == current_user.id,
                Review.media_id == media_id,
                Review.media_type == media_type,
                Review.episode == body.episode,
            )
        )
    )
    review = existing.scalar_one_or_none()

    if review:
        # Actualizar en lugar de crear
        if body.score is not None:
            review.score = body.score
        if body.body is not None:
            review.body = body.body
    else:
        review = Review(
            user_id=current_user.id,
            media_id=media_id,
            media_type=media_type,
            score=body.score,
            body=body.body,
            episode=body.episode,
        )
        db.add(review)

    await db.flush()
    return await _to_public(review, db)


@router.delete("/{review_id}", status_code=204)
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elimina la propia reseña del usuario."""
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes eliminar la reseña de otro usuario")

    await db.delete(review)
