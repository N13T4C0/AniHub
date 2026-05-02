# 🎬 AniHub

> Tu portal definitivo para descubrir y ver anime — rápido, moderno y con acceso directo a múltiples plataformas.

---

## 🏗️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 + Tailwind CSS + shadcn/ui |
| Backend | Python + FastAPI |
| Base de datos | PostgreSQL 16 |
| Cache | Redis 7 |
| Tareas programadas | Celery + Beat |
| Contenedores | Docker + Docker Compose |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway / Render |

---

## 🚀 Inicio rápido

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)
- [Python 3.12+](https://www.python.org/)

### 1. Clonar y configurar entorno
```bash
git clone https://github.com/tu-usuario/anihub.git
cd anihub
cp .env.example .env
# Edita .env con tus valores
```

### 2. Levantar con Docker (recomendado)
```bash
docker compose up -d
```

La app estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Docs API**: http://localhost:8000/docs

### 3. Desarrollo sin Docker

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Estructura del proyecto

```
anihub/
├── backend/                 # FastAPI API
│   ├── app/
│   │   ├── api/routers/    # Endpoints REST
│   │   ├── core/           # Config, seguridad, DB
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Schemas Pydantic
│   │   ├── services/       # Lógica de negocio
│   │   └── scrapers/       # Web scrapers
│   ├── tests/
│   └── requirements.txt
├── frontend/                # Next.js App
│   └── src/
│       ├── app/            # App Router (páginas)
│       ├── components/     # Componentes reutilizables
│       ├── hooks/          # Custom hooks
│       ├── lib/            # Utilidades, API client
│       └── types/          # TypeScript types
├── docs/                   # Documentación adicional
├── scripts/                # Scripts de utilidad
├── nginx/                  # Config nginx (producción)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/anime/search?q=naruto` | Buscar anime |
| GET | `/api/v1/anime/{id}` | Detalle de un anime |
| GET | `/api/v1/anime/trending` | Anime en tendencia |
| GET | `/api/v1/anime/seasonal` | Anime de la temporada |
| POST | `/api/v1/user/list` | Guardar en lista personal |
| GET | `/api/v1/user/list` | Obtener lista personal |

---

## 🗺️ Roadmap

### Fase 1 — MVP (Semanas 1-4)
- [x] Estructura del proyecto
- [ ] Backend: FastAPI + PostgreSQL + AniList API
- [ ] Frontend: Búsqueda + Detalle de anime
- [ ] Sistema de links a plataformas
- [ ] Lista personal (localStorage)

### Fase 2 — Comunidad (Semanas 5-8)
- [ ] Sistema de autenticación (JWT)
- [ ] Reviews y ratings propios
- [ ] Listas públicas compartibles
- [ ] Notificaciones de nuevos episodios

### Fase 3 — Monetización (Semanas 9-12)
- [ ] Google AdSense integración
- [ ] Features premium (sin ads, notificaciones push)
- [ ] Sistema de referidos a plataformas legales
- [ ] Analytics y dashboard de métricas

---

## ⚠️ Disclaimer Legal

AniHub es un **agregador de información y enlaces**. No almacena, distribuye ni hostea contenido multimedia. 
Todos los derechos sobre las obras listadas pertenecen a sus respectivos propietarios.

---

## 📄 Licencia

MIT © 2025 AniHub
