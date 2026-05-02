from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class ListEntryCreate(BaseModel):
    media_id: int
    media_type: str          # ANIME | MANGA
    title: str
    cover_image: Optional[str] = None
    status: str = "plan_to_watch"
    progress: int = 0
    total: Optional[int] = None
    score: Optional[int] = None

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        allowed = {"watching", "completed", "plan_to_watch", "dropped"}
        if v not in allowed:
            raise ValueError(f"Estado inválido. Opciones: {allowed}")
        return v

    @field_validator("score")
    @classmethod
    def score_valid(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 10):
            raise ValueError("El score debe estar entre 1 y 10")
        return v


class ListEntryUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    score: Optional[int] = None

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"watching", "completed", "plan_to_watch", "dropped"}
            if v not in allowed:
                raise ValueError(f"Estado inválido. Opciones: {allowed}")
        return v


class ListEntryResponse(BaseModel):
    id: int
    media_id: int
    media_type: str
    title: str
    cover_image: Optional[str]
    status: str
    progress: int
    total: Optional[int]
    score: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
