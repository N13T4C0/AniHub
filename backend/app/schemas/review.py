from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class ReviewCreate(BaseModel):
    score: Optional[int] = Field(None, ge=1, le=10)
    body: Optional[str] = Field(None, min_length=1, max_length=4000)
    episode: Optional[int] = Field(None, ge=1)  # None = reseña general

    @model_validator(mode="after")
    def require_score_or_body(self) -> "ReviewCreate":
        if self.score is None and (self.body is None or self.body.strip() == ""):
            raise ValueError("Debes incluir una puntuación, un comentario, o ambos.")
        return self


class ReviewPublic(BaseModel):
    id: int
    user_id: int
    username: str          # se inyecta al serializar
    media_id: int
    media_type: str
    score: Optional[int]
    body: Optional[str]
    episode: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewList(BaseModel):
    items: list[ReviewPublic]
    total: int
    avg_score: Optional[float]   # media de puntuaciones, None si no hay ninguna
