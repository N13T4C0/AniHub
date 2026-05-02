from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, UniqueConstraint
from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    media_id = Column(Integer, nullable=False, index=True)
    media_type = Column(String, nullable=False)         # ANIME | MANGA

    # Reseña de serie (score global + texto)
    score = Column(Integer, nullable=True)              # 1–10, null si solo comenta
    body = Column(Text, nullable=True)                  # texto de la reseña

    # Comentario por episodio/capítulo (opcional)
    episode = Column(Integer, nullable=True)            # número de ep/cap; null = reseña general

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Un usuario solo puede tener una reseña general por título
    # (pueden tener múltiples comentarios por episodio, pero no duplicados en el mismo ep)
    __table_args__ = (
        UniqueConstraint("user_id", "media_id", "media_type", "episode", name="uq_user_media_ep"),
    )
