<div align="center">

<img src="https://img.shields.io/badge/AniHub-anime%20%7C%20manga%20%7C%20manhwa-6C63FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNGwtNC00IDEuNDEtMS40MUwxMCAxMy4xN2w2LjU5LTYuNTlMMTggOGwtOCA4eiIvPjwvc3ZnPg==" alt="AniHub" />

# AniHub

**Tu portal definitivo de anime, manga y manhwa**

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel)](https://anihub-livid.vercel.app)

[🌐 Ver Demo](https://anihub-livid.vercel.app) · [📖 Docs API](https://anihub-livid.vercel.app/docs) · [🐛 Reportar Bug](https://github.com/N13T4C0/AniHub/issues)

</div>

---

## ✨ ¿Qué es AniHub?

AniHub es una plataforma moderna para descubrir y seguir anime, manga y manhwa. Conecta con la API de AniList para ofrecerte información actualizada, con una interfaz visual inmersiva que incluye efectos de partículas Three.js, carruseles animados y un sistema completo de listas personales.

```
🎌 Tendencias en tiempo real      🌸 Efectos visuales Three.js
📚 Manga, manhwa y manhua          🎭 Géneros con filtros avanzados
👤 Listas personales               💬 Foro de la comunidad
🎲 Generador de playlist           📅 Calendario de temporada
```

---

## 🛠️ Stack tecnológico

<table>
  <tr>
    <td><b>Capa</b></td>
    <td><b>Tecnología</b></td>
  </tr>
  <tr>
    <td>🖥️ Frontend</td>
    <td>Next.js 15 · Tailwind CSS · Three.js · TypeScript</td>
  </tr>
  <tr>
    <td>⚙️ Backend</td>
    <td>Python 3.12 · FastAPI · SQLAlchemy · Pydantic</td>
  </tr>
  <tr>
    <td>🗄️ Base de datos</td>
    <td>SQLite (dev) · PostgreSQL (prod)</td>
  </tr>
  <tr>
    <td>🔐 Auth</td>
    <td>JWT · Passlib · Bcrypt</td>
  </tr>
  <tr>
    <td>📡 API externa</td>
    <td>AniList GraphQL API</td>
  </tr>
  <tr>
    <td>🚀 Deploy</td>
    <td>Vercel (frontend) · Railway (backend)</td>
  </tr>
  <tr>
    <td>🐳 Contenedores</td>
    <td>Docker · Docker Compose</td>
  </tr>
</table>

---

## 🚀 Inicio rápido

### Prerrequisitos

- [Node.js 20+](https://nodejs.org/)
- [Python 3.12+](https://www.python.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(opcional)*

### Con Docker (recomendado)

```bash
git clone https://github.com/N13T4C0/AniHub.git
cd AniHub
docker compose up -d
```

| Servicio | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |

### Sin Docker

**Backend:**
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac / Linux
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
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
AniHub/
├── 📂 backend/
│   └── app/
│       ├── api/routers/      # Endpoints REST
│       ├── core/             # Config, seguridad, DB
│       ├── models/           # Modelos SQLAlchemy
│       ├── schemas/          # Schemas Pydantic
│       └── services/         # Lógica de negocio
│
├── 📂 frontend/
│   └── src/
│       ├── app/              # App Router (páginas)
│       ├── components/       # Componentes reutilizables
│       │   ├── home/         # Hero, carrusel, stats
│       │   └── layout/       # Navbar, partículas Three.js
│       ├── hooks/            # Custom hooks
│       ├── lib/              # API client, utilidades
│       └── types/            # TypeScript types
│
├── 📂 nginx/                 # Config proxy (producción)
├── 📂 docs/                  # Documentación adicional
├── 🐳 docker-compose.yml
└── 📄 README.md
```

---

## 📡 API Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/media/trending/anime` | Anime en tendencia |
| `GET` | `/api/v1/media/search` | Buscar anime / manga |
| `GET` | `/api/v1/media/{id}` | Detalle de un título |
| `GET` | `/api/v1/season/{season}/{year}` | Temporada actual |
| `POST` | `/api/v1/auth/register` | Registro de usuario |
| `POST` | `/api/v1/auth/login` | Login con JWT |
| `GET` | `/api/v1/list/` | Lista personal del usuario |
| `POST` | `/api/v1/list/` | Añadir a lista personal |

Documentación interactiva completa en `/docs` (Swagger UI).

---

## 🗺️ Roadmap

- [x] Estructura del proyecto y stack base
- [x] Integración con AniList API
- [x] Carrusel animado con Three.js (lluvia / sakura)
- [x] Búsqueda con infinite scroll
- [x] Sistema de autenticación JWT
- [x] Listas personales de usuario
- [x] Foro de la comunidad
- [x] Generador de playlist
- [x] Calendario de temporada
- [x] Deploy en Vercel + Railway
- [ ] Notificaciones de nuevos episodios
- [ ] Reviews y ratings propios
- [ ] Listas públicas compartibles
- [ ] PWA / App móvil

---

## ⚠️ Aviso legal

AniHub es un **agregador de información**. No almacena, distribuye ni hostea contenido multimedia. Toda la información proviene de [AniList](https://anilist.co) y los derechos de las obras pertenecen a sus respectivos propietarios.

---

<div align="center">

MIT © 2025 · Hecho con ❤️ por [N13T4C0](https://github.com/N13T4C0)

</div>
