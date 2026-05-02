# AniHub — Documento de Visión
> Estado: aprobado · Última actualización: Mayo 2026

---

## El problema

El anime, manga y manhwa están fragmentados. Hay docenas de plataformas de streaming, los usuarios no saben dónde está cada serie, y las herramientas existentes (MAL, AniList) están en inglés, sin comunidad real en español ni reviews por episodio.

## La solución

AniHub es un hub centralizado global para fans de anime, manga y manhwa. Un solo lugar para buscar, descubrir, saber dónde ver, y opinar — tanto de series completas como de episodios individuales — en cualquier idioma.

---

## Decisiones de producto confirmadas

### Contenido
- ✅ Anime (series y películas)
- ✅ Manga
- ✅ Manhwa / Manhua
- ❌ Light novels (fuera del alcance por ahora)

### Audiencia
- **Global** — sin foco regional específico
- **Multiidioma**: el usuario elige su idioma; títulos y sinopsis se muestran en el idioma disponible (español si existe, inglés como fallback)

### Diseño
- **Referencia visual**: AniList (moderno, oscuro, limpio)
- **Prioridad**: Desktop-first, responsive para móvil

### Autenticación
- Email + contraseña
- Login con Google
- **Regla clave**: leer sin cuenta, escribir (reviews, comentarios, lista) requiere registro

### Ratings
- Escala **1–10 numérica** (tanto por serie como por episodio)

### Links a plataformas
- Se generan **automáticamente** desde AniList API + expansión propia
- **Incluir desde el inicio**: plataformas legales (Crunchyroll, Netflix, Prime) Y alternativas (Gogoanime, 9anime, etc.)
- Los alternativos se muestran con un disclaimer visual claro

### Nombre
- **AniHub** (provisional — puede cambiar antes del lanzamiento)

---

## Qué hace AniHub que no hace nadie más

| Característica | MAL | AniList | Crunchyroll | **AniHub** |
|---|---|---|---|---|
| Multiidioma real | ❌ | Parcial | Parcial | ✅ |
| Anime + Manga + Manhwa | ✅ | ✅ | Solo anime | ✅ |
| Reviews por episodio | ❌ | ❌ | ❌ | ✅ |
| Dónde ver (todas las plataformas) | ❌ | Parcial | Solo Crunchyroll | ✅ |
| Ver sin cuenta | ✅ | ✅ | Parcial | ✅ |
| Lista personal | ✅ | ✅ | ✅ | ✅ |
| Rating 1–10 por episodio | ❌ | ❌ | ❌ | ✅ |

---

## MVP — Funcionalidades confirmadas

### 1. Búsqueda y descubrimiento
- Buscar por nombre, género, año, estado, formato
- Filtros avanzados
- Página de tendencias y temporada actual
- Cubre anime, manga y manhwa

### 2. Ficha de serie/obra
- Sinopsis, géneros, estudio, episodios/capítulos, estado
- Poster, banner, trailer (si existe)
- **Rating promedio de AniHub** (calculado de reviews de usuarios)
- Links a plataformas: legales primero, alternativos con disclaimer

### 3. Sistema de reviews
- **Por serie**: rating 1–10 + texto libre
- **Por episodio/capítulo**: rating 1–10 + comentario
- Likes en reviews de otros usuarios
- Requiere cuenta para escribir, lectura libre

### 4. Lista personal
- Estados: Viendo / Completado / Pendiente / Abandonado
- Tracking de episodio/capítulo actual
- Puntuación personal (1–10)
- Requiere cuenta para guardar en la nube

### 5. Cuentas de usuario
- Registro con email + contraseña
- Login con Google
- Perfil público con lista, reviews y estadísticas básicas

---

## Fuera del MVP

- Notificaciones de nuevos episodios
- Sistema de recomendaciones automáticas
- App móvil
- Monetización / ads
- Panel de administración
- Moderación avanzada de contenido

---

## Stack técnico

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js 15 + Tailwind CSS | SSR para SEO, App Router, deploy en Vercel |
| Backend | Python + FastAPI | Async, tipado, auto-docs, ideal para múltiples APIs |
| Base de datos | PostgreSQL | Usuarios, listas, reviews, relaciones complejas |
| Cache | Redis | Búsquedas repetidas, trending, fichas de series |
| Fuente de datos | AniList GraphQL API | Cubre anime + manga, datos ricos, sin costo |
| Auth | NextAuth.js + JWT | Google OAuth + email/password |
| Deploy frontend | Vercel | 1-click, CDN global |
| Deploy backend | Railway | Simple, tier gratuito generoso |

---

## Flujo del usuario típico

```
Llega a AniHub
      ↓
Busca "Solo Leveling" o navega por géneros/tendencias
      ↓
Ve la ficha: sinopsis, rating, dónde ver, trailer
      ↓
Lee reviews de la serie y comentarios por capítulo
      ↓
Se registra (o no, si solo quiere leer)
      ↓
Agrega a su lista → escribe su review → puntúa capítulos
      ↓
Descubre obras relacionadas → repite el ciclo
```

---

## Fases de desarrollo

### Fase 1 — MVP (base funcional)
Búsqueda · fichas · links a plataformas · sistema de reviews · lista personal · cuentas de usuario

### Fase 2 — Crecimiento de comunidad
Listas públicas compartibles · follows entre usuarios · foros o threads por serie

### Fase 3 — Monetización y escala
Google AdSense · modelo freemium · afiliados con plataformas legales · recomendaciones personalizadas
