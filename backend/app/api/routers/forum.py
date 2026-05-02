"""
Router del foro de AniHub.
GET  /api/v1/forum/categories
GET  /api/v1/forum/threads?category=&page=&per_page=
POST /api/v1/forum/threads
GET  /api/v1/forum/threads/{thread_id}
DELETE /api/v1/forum/threads/{thread_id}
POST /api/v1/forum/threads/{thread_id}/posts
PUT  /api/v1/forum/posts/{post_id}
DELETE /api/v1/forum/posts/{post_id}
POST /api/v1/forum/posts/{post_id}/react
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, update as sql_update
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user, get_optional_user
from app.models.user import User
from app.models.forum import ForumCategory, ForumThread, ForumPost, ForumReaction

router = APIRouter(prefix="/forum", tags=["forum"])

# ── Schemas ────────────────────────────────────────────────────

ALLOWED_EMOJIS = {"❤️", "😂", "🔥", "👏", "😮", "💯", "😭", "⭐"}

class CategoryOut(BaseModel):
    id: int; slug: str; name: str
    description: Optional[str]; icon: Optional[str]; color: Optional[str]
    thread_count: int = 0

class ThreadCreate(BaseModel):
    category_slug: str
    title: str = Field(..., min_length=5, max_length=200)
    body: str = Field(..., min_length=10)
    media_id: Optional[int] = None
    media_type: Optional[str] = None
    media_title: Optional[str] = None
    media_cover: Optional[str] = None

class ThreadSummary(BaseModel):
    id: int; title: str; category_slug: str; category_name: str
    username: str; user_id: int
    views: int; reply_count: int
    is_pinned: bool; is_locked: bool
    media_id: Optional[int]; media_type: Optional[str]
    media_title: Optional[str]; media_cover: Optional[str]
    created_at: str; updated_at: str
    preview: str  # first 200 chars of body

class PostOut(BaseModel):
    id: int; thread_id: int; user_id: int; username: str
    body: str; is_deleted: bool
    quote_id: Optional[int]; quote_body: Optional[str]; quote_username: Optional[str]
    reactions: dict  # {"❤️": 3, "🔥": 1}
    my_reactions: list  # emojis the current user reacted with
    created_at: str; updated_at: str

class ThreadDetail(BaseModel):
    id: int; title: str; body: str
    category_slug: str; category_name: str
    username: str; user_id: int
    views: int; is_pinned: bool; is_locked: bool
    media_id: Optional[int]; media_type: Optional[str]
    media_title: Optional[str]; media_cover: Optional[str]
    created_at: str
    posts: list[PostOut]
    total_posts: int

class PostCreate(BaseModel):
    body: str = Field(..., min_length=1)
    quote_id: Optional[int] = None

class ReactCreate(BaseModel):
    emoji: str

# ── Seed categories (called from startup) ─────────────────────

DEFAULT_CATEGORIES = [
    {"slug": "anime-general", "name": "Anime General",      "description": "Debates sobre anime, temporadas y noticias",  "icon": "Tv",         "color": "violet", "order": 1},
    {"slug": "manga",         "name": "Manga & Manhwa",     "description": "Todo sobre manga, manhwa y manhua",           "icon": "BookOpen",   "color": "pink",   "order": 2},
    {"slug": "noticias",      "name": "Noticias & Industry","description": "Anuncios, licencias y noticias de la industria","icon": "Newspaper",  "color": "blue",   "order": 3},
    {"slug": "recomendaciones","name": "Recomendaciones",   "description": "Pide o da recomendaciones a la comunidad",    "icon": "Sparkles",   "color": "yellow", "order": 4},
    {"slug": "analisis",      "name": "Análisis & Teorías", "description": "Teorías, análisis en profundidad y ensayos",   "icon": "FlaskConical","color": "emerald","order": 5},
    {"slug": "off-topic",     "name": "Off-Topic",          "description": "Charla libre, gatitos y lo que se te ocurra", "icon": "Coffee",     "color": "orange", "order": 6},
]

async def seed_categories(db: AsyncSession):
    for cat in DEFAULT_CATEGORIES:
        existing = await db.execute(select(ForumCategory).where(ForumCategory.slug == cat["slug"]))
        if not existing.scalar_one_or_none():
            db.add(ForumCategory(**cat))
    await db.commit()

# ── Helpers ────────────────────────────────────────────────────

def _post_out(post: ForumPost, current_user_id: Optional[int] = None) -> PostOut:
    reaction_counts: dict = {}
    my_reactions = []
    for r in post.reactions:
        reaction_counts[r.emoji] = reaction_counts.get(r.emoji, 0) + 1
        if current_user_id and r.user_id == current_user_id:
            my_reactions.append(r.emoji)

    quote_body = None
    quote_username = None
    if post.quote:
        quote_body = post.quote.body[:200] if not post.quote.is_deleted else "[eliminado]"
        quote_username = post.quote.user.username if post.quote.user else "?"

    return PostOut(
        id=post.id, thread_id=post.thread_id,
        user_id=post.user_id, username=post.user.username,
        body="[eliminado]" if post.is_deleted else post.body,
        is_deleted=post.is_deleted,
        quote_id=post.quote_id, quote_body=quote_body, quote_username=quote_username,
        reactions=reaction_counts, my_reactions=my_reactions,
        created_at=post.created_at.isoformat(), updated_at=post.updated_at.isoformat(),
    )

# ── Endpoints ──────────────────────────────────────────────────

@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    rows = await db.execute(
        select(ForumCategory).where(ForumCategory.is_active == True).order_by(ForumCategory.order)
    )
    categories = rows.scalars().all()
    result = []
    for c in categories:
        count_row = await db.execute(
            select(func.count()).select_from(ForumThread).where(ForumThread.category_id == c.id)
        )
        result.append(CategoryOut(
            id=c.id, slug=c.slug, name=c.name,
            description=c.description, icon=c.icon, color=c.color,
            thread_count=count_row.scalar_one(),
        ))
    return result


@router.get("/threads")
async def list_threads(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    q = select(ForumThread).options(selectinload(ForumThread.user), selectinload(ForumThread.category))
    if category:
        q = q.join(ForumCategory).where(ForumCategory.slug == category)
    # pinned first, then by updated_at
    q = q.order_by(ForumThread.is_pinned.desc(), ForumThread.updated_at.desc())
    q = q.offset((page - 1) * per_page).limit(per_page)
    rows = await db.execute(q)
    threads = rows.scalars().all()

    result = []
    for t in threads:
        post_count = await db.execute(
            select(func.count()).select_from(ForumPost).where(
                and_(ForumPost.thread_id == t.id, ForumPost.is_deleted == False)
            )
        )
        result.append(ThreadSummary(
            id=t.id, title=t.title, category_slug=t.category.slug, category_name=t.category.name,
            username=t.user.username, user_id=t.user_id,
            views=t.views, reply_count=post_count.scalar_one(),
            is_pinned=t.is_pinned, is_locked=t.is_locked,
            media_id=t.media_id, media_type=t.media_type,
            media_title=t.media_title, media_cover=t.media_cover,
            created_at=t.created_at.isoformat(), updated_at=t.updated_at.isoformat(),
            preview=t.body[:200],
        ))
    return result


@router.post("/threads", status_code=201)
async def create_thread(
    body: ThreadCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cat_row = await db.execute(select(ForumCategory).where(ForumCategory.slug == body.category_slug))
    cat = cat_row.scalar_one_or_none()
    if not cat:
        raise HTTPException(404, "Categoría no encontrada")

    thread = ForumThread(
        category_id=cat.id, user_id=current_user.id,
        title=body.title, body=body.body,
        media_id=body.media_id, media_type=body.media_type,
        media_title=body.media_title, media_cover=body.media_cover,
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return {"id": thread.id}


@router.get("/threads/{thread_id}")
async def get_thread(
    thread_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    t_row = await db.execute(
        select(ForumThread)
        .options(selectinload(ForumThread.user), selectinload(ForumThread.category))
        .where(ForumThread.id == thread_id)
    )
    t = t_row.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Hilo no encontrado")

    # Increment views
    await db.execute(
        sql_update(ForumThread).where(ForumThread.id == thread_id).values(views=ForumThread.views + 1)
    )
    await db.commit()

    # Load posts
    posts_q = (
        select(ForumPost)
        .options(
            selectinload(ForumPost.user),
            selectinload(ForumPost.reactions).selectinload(ForumReaction.user),
            selectinload(ForumPost.quote).selectinload(ForumPost.user),
        )
        .where(ForumPost.thread_id == thread_id)
        .order_by(ForumPost.created_at)
        .offset((page - 1) * per_page).limit(per_page)
    )
    posts_rows = await db.execute(posts_q)
    posts = posts_rows.scalars().all()

    total_row = await db.execute(
        select(func.count()).select_from(ForumPost).where(ForumPost.thread_id == thread_id)
    )

    uid = current_user.id if current_user else None
    return ThreadDetail(
        id=t.id, title=t.title, body=t.body,
        category_slug=t.category.slug, category_name=t.category.name,
        username=t.user.username, user_id=t.user_id,
        views=t.views + 1, is_pinned=t.is_pinned, is_locked=t.is_locked,
        media_id=t.media_id, media_type=t.media_type,
        media_title=t.media_title, media_cover=t.media_cover,
        created_at=t.created_at.isoformat(),
        posts=[_post_out(p, uid) for p in posts],
        total_posts=total_row.scalar_one(),
    )


@router.delete("/threads/{thread_id}", status_code=204)
async def delete_thread(
    thread_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t_row = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    t = t_row.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Hilo no encontrado")
    if t.user_id != current_user.id:
        raise HTTPException(403, "No tienes permiso")
    await db.delete(t)
    await db.commit()


@router.post("/threads/{thread_id}/posts", status_code=201)
async def create_post(
    thread_id: int,
    body: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t_row = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    t = t_row.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Hilo no encontrado")
    if t.is_locked:
        raise HTTPException(403, "Hilo bloqueado")

    post = ForumPost(thread_id=thread_id, user_id=current_user.id, body=body.body, quote_id=body.quote_id)
    db.add(post)
    # Update thread.updated_at to bump to top
    await db.execute(sql_update(ForumThread).where(ForumThread.id == thread_id).values(updated_at=post.created_at))
    await db.commit()
    await db.refresh(post)
    return {"id": post.id}


@router.put("/posts/{post_id}")
async def edit_post(
    post_id: int,
    body: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    p_row = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    p = p_row.scalar_one_or_none()
    if not p or p.user_id != current_user.id:
        raise HTTPException(403, "No tienes permiso")
    p.body = body.body
    await db.commit()
    return {"detail": "OK"}


@router.delete("/posts/{post_id}", status_code=204)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    p_row = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    p = p_row.scalar_one_or_none()
    if not p or p.user_id != current_user.id:
        raise HTTPException(403, "No tienes permiso")
    p.is_deleted = True
    p.body = "[eliminado]"
    await db.commit()


@router.post("/posts/{post_id}/react")
async def react_to_post(
    post_id: int,
    body: ReactCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.emoji not in ALLOWED_EMOJIS:
        raise HTTPException(400, "Emoji no permitido")

    existing = await db.execute(
        select(ForumReaction).where(
            and_(ForumReaction.post_id == post_id,
                 ForumReaction.user_id == current_user.id,
                 ForumReaction.emoji == body.emoji)
        )
    )
    r = existing.scalar_one_or_none()
    if r:
        await db.delete(r)
        await db.commit()
        return {"action": "removed"}
    else:
        db.add(ForumReaction(post_id=post_id, user_id=current_user.id, emoji=body.emoji))
        await db.commit()
        return {"action": "added"}
