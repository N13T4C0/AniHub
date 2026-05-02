"""
Modelos del foro de AniHub.
Categorías → Hilos → Posts → Reacciones
"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime,
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def _now():
    return datetime.now(timezone.utc)


class ForumCategory(Base):
    __tablename__ = "forum_categories"

    id       = Column(Integer, primary_key=True)
    slug     = Column(String(50), unique=True, nullable=False)
    name     = Column(String(100), nullable=False)
    description = Column(String(255))
    icon     = Column(String(50))          # lucide icon name
    color    = Column(String(20))          # tailwind color prefix
    order    = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    threads  = relationship("ForumThread", back_populates="category")


class ForumThread(Base):
    __tablename__ = "forum_threads"

    id          = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("forum_categories.id", ondelete="CASCADE"), nullable=False)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title       = Column(String(200), nullable=False)
    body        = Column(Text, nullable=False)
    is_pinned   = Column(Boolean, default=False)
    is_locked   = Column(Boolean, default=False)
    views       = Column(Integer, default=0)
    # media link (optional — para hilos sobre un anime/manga específico)
    media_id    = Column(Integer, nullable=True)
    media_type  = Column(String(10), nullable=True)
    media_title = Column(String(200), nullable=True)
    media_cover = Column(String(500), nullable=True)

    created_at  = Column(DateTime(timezone=True), default=_now)
    updated_at  = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    category = relationship("ForumCategory", back_populates="threads")
    user     = relationship("User")
    posts    = relationship("ForumPost", back_populates="thread", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_thread_category", "category_id"),
        Index("ix_thread_user", "user_id"),
    )


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id        = Column(Integer, primary_key=True)
    thread_id = Column(Integer, ForeignKey("forum_threads.id", ondelete="CASCADE"), nullable=False)
    user_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    body      = Column(Text, nullable=False)
    quote_id  = Column(Integer, ForeignKey("forum_posts.id", ondelete="SET NULL"), nullable=True)
    is_deleted = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    thread    = relationship("ForumThread", back_populates="posts")
    user      = relationship("User")
    quote     = relationship("ForumPost", remote_side="ForumPost.id")
    reactions = relationship("ForumReaction", back_populates="post", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_post_thread", "thread_id"),)


class ForumReaction(Base):
    __tablename__ = "forum_reactions"

    id      = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji   = Column(String(10), nullable=False)   # "❤️" "😂" "🔥" "👏" "😮" "💯"

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", "emoji"),
        Index("ix_reaction_post", "post_id"),
    )

    post = relationship("ForumPost", back_populates="reactions")
    user = relationship("User")
