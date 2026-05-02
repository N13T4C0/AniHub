# AniHub — Arquitectura Técnica

## Visión general

AniHub es un agregador de anime que permite buscar, descubrir y encontrar dónde ver anime desde múltiples plataformas. El proyecto está diseñado para escalar desde un MVP hasta un producto monetizable.

---

## Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    USUARIO                          │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Next.js 15 (Vercel)                    │
│   ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│   │  /       │  │ /search  │  │  /anime/[id]    │  │
│   │ (Home)   │  │(Búsqueda)│  │  (Detalle)      │  │
│   └──────────┘  └──────────┘  └─────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ API calls
                        ▼
┌─────────────────────────────────────────────────────┐
│             FastAPI (Railway/Render)                │
│  ┌────────────────────────────────────────────────┐ │
│  │  GET /api/v1/anime/search                      │ │
│  │  GET /api/v1/anime/trending                    │ │
│  │  GET /api/v1/anime/{id}                        │ │
│  └────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────────────────────┘
           │
    ┌──────┴────────┐
    │               │
    ▼               ▼
┌────────┐    ┌──────────┐
│ Redis  │    │AniList   │
│(Cache) │    │GraphQL   │
│        │    │API       │
└────────┘    └──────────┘
                   │
          (Fase 2) ▼
           ┌────────────┐
           │ PostgreSQL │
           │(metadata + │
           │ usuarios)  │
           └────────────┘
```

---

## Decisiones técnicas clave

### Por qué FastAPI (Python)
- Tipado con Pydantic — mismo modelo de datos en backend y frontend (via TypeScript)
- Async nativo — ideal para múltiples llamadas a APIs externas en paralelo
- Auto-documentación con Swagger UI en `/docs`
- Ecosistema maduro para scrapers (BeautifulSoup, Playwright)

### Por qué Next.js 15 App Router
- SSR/SSG — páginas de anime indexables por Google (SEO crucial para monetización)
- Server Components — reducen el JavaScript en cliente
- `revalidate` — cache automático de páginas de anime (1 hora)
- Vercel deploy en 1 click

### Por qué AniList API (y no MAL)
- API GraphQL pública y sin límite de rate tan restrictivo
- Datos más ricos (relaciones, colores de cover, popularidad)
- No requiere autenticación para lectura
- MAL se puede agregar como fuente adicional en Fase 2

### Por qué Redis para caché
- Búsquedas repetidas (las mismas 10-20 búsquedas representan el 80% del tráfico)
- TTL configurable por tipo de dato
- Reduce llamadas a AniList API y mejora latencia

---

## Plan de monetización

### Fase 1 — Tráfico orgánico (gratuito)
El SEO es la clave. Cada página de anime `/anime/{id}` es una landing page potencial.
Con 10,000 animes indexados → 10,000 páginas SEO-optimizadas.

### Fase 2 — Google AdSense
Una vez con 1,000+ visitas/día:
- Banner ads en `/search` (sidebar)
- Ad nativo en `/anime/{id}` (entre sinopsis y links)
- Respetar UX: máximo 2 ads por página

### Fase 3 — Modelo freemium
| Free | Premium ($3.99/mes) |
|------|---------------------|
| Ads | Sin ads |
| Búsqueda básica | Filtros avanzados guardados |
| Lista personal (local) | Lista en la nube + sync |
| — | Notificaciones de nuevos eps |
| — | Recomendaciones personalizadas |

### Fase 4 — Afiliados
- Comisión por referidos a Crunchyroll, VRV, etc.
- Priorizar links legales con tracking de afiliado

---

## Roadmap técnico

### ✅ Completado
- Estructura del proyecto
- Backend FastAPI con AniList API
- Frontend Next.js con páginas de búsqueda y detalle
- Docker Compose para desarrollo local

### 🔄 En progreso (Fase 1)
- [ ] Página de búsqueda con filtros completos
- [ ] Lista personal con localStorage
- [ ] Deploy inicial en Vercel + Railway
- [ ] SEO básico (metadata, OG tags)

### 📋 Planeado (Fase 2)
- [ ] Sistema de autenticación (NextAuth.js + JWT)
- [ ] PostgreSQL para usuarios y listas
- [ ] Reviews y ratings propios
- [ ] Scrapers de links de streaming adicionales
- [ ] Notificaciones de nuevos episodios

### 🔮 Futuro (Fase 3+)
- [ ] Sistema de recomendaciones (collaborative filtering)
- [ ] App móvil (React Native)
- [ ] Discord/Telegram bot
- [ ] Panel de administración

---

## Variables de entorno

Todas las variables están documentadas en `.env.example`.
Nunca commitear el archivo `.env` real.

## Convenciones de código

- **Backend**: PEP 8, type hints en todas las funciones, docstrings en servicios
- **Frontend**: ESLint + Prettier, componentes en PascalCase, hooks en camelCase con prefijo `use`
- **Git**: Commits en español con prefijo: `feat:`, `fix:`, `docs:`, `refactor:`
