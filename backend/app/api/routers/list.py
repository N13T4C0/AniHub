from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.user_list import UserListEntry
from app.schemas.list_entry import ListEntryCreate, ListEntryUpdate, ListEntryResponse

router = APIRouter(prefix="/list", tags=["list"])


@router.get("", response_model=List[ListEntryResponse])
async def get_list(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Devuelve toda la lista personal del usuario."""
    result = await db.execute(
        select(UserListEntry)
        .where(UserListEntry.user_id == current_user.id)
        .order_by(UserListEntry.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ListEntryResponse, status_code=201)
async def add_to_list(
    body: ListEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Agrega una obra a la lista personal."""
    # Verificar si ya existe
    existing = await db.execute(
        select(UserListEntry).where(
            UserListEntry.user_id == current_user.id,
            UserListEntry.media_id == body.media_id,
            UserListEntry.media_type == body.media_type,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya está en tu lista")

    entry = UserListEntry(user_id=current_user.id, **body.model_dump())
    db.add(entry)
    await db.flush()
    return entry


@router.patch("/{media_id}", response_model=ListEntryResponse)
async def update_entry(
    media_id: int,
    body: ListEntryUpdate,
    media_type: str = "ANIME",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Actualiza estado, progreso o score de una entrada."""
    result = await db.execute(
        select(UserListEntry).where(
            UserListEntry.user_id == current_user.id,
            UserListEntry.media_id == media_id,
            UserListEntry.media_type == media_type,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(entry, field, value)

    return entry


@router.delete("/{media_id}", status_code=204)
async def remove_from_list(
    media_id: int,
    media_type: str = "ANIME",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Elimina una obra de la lista personal."""
    await db.execute(
        delete(UserListEntry).where(
            UserListEntry.user_id == current_user.id,
            UserListEntry.media_id == media_id,
            UserListEntry.media_type == media_type,
        )
    )
