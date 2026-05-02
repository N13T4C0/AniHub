from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, UniqueConstraint
from app.core.database import Base


class UserListEntry(Base):
    __tablename__ = "user_list"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    media_id = Column(Integer, nullable=False)
    media_type = Column(String, nullable=False)   # ANIME | MANGA
    title = Column(String, nullable=False)
    cover_image = Column(String, nullable=True)
    # Estado: watching | completed | plan_to_watch | dropped
    status = Column(String, nullable=False, default="plan_to_watch")
    progress = Column(Integer, default=0)         # episodios/capítulos vistos
    total = Column(Integer, nullable=True)        # total de eps/caps
    score = Column(Integer, nullable=True)        # 1–10
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "media_id", "media_type", name="uq_user_media"),
    )
