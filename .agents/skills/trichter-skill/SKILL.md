---
name: trichter-content-research
description: Use this skill when the user wants to generate LinkedIn organic content for Trichter Consulting (real estate growth partner LATAM). Triggers on requests like "armemos contenido para Trichter", "necesito posts para LinkedIn de Trichter", "research de tendencias inmobiliarias", "creemos un carrusel sobre [tema]", or "generemos un batch de imágenes para Higgsfield". The skill orchestrates a 5-phase pipeline with human approval gates: research (Playwright + web), concept matrix, prompt + copy generation, Higgsfield batch execution, and delivery with A/B recommendations. Designed for Spanish (neutral LATAM) B2B content targeting real estate developers in Mexico, Argentina, and Uruguay.
---

# Trichter Content Research & Generation Skill

Pipeline orquestado de 5 fases con compuertas de aprobación humana entre cada una. **NUNCA saltar fases. NUNCA ejecutar Higgsfield sin aprobación explícita de prompts.**

## Cómo invocar este skill

El usuario dice algo como:
- "Trichter: armemos contenido sobre [tema]"
- "Generemos 3 piezas de LinkedIn sobre seguimiento comercial"
- "Necesito un carrusel sobre CAC para developers"

## Parámetros que el skill debe extraer del prompt

Antes de empezar, identificar (preguntar solo lo que falte):

1. **Tema o ángulo de research** (obligatorio)
2. **Cantidad de piezas** (default: 3)
3. **Mix carrusel/single** (default: respetar 40/60 del brand.md)
4. **Largo de carrusel si aplica** (default: 4 slides)
5. **Audiencia primaria** (default: Segmento A — developers medianos LATAM)

Si falta el tema, preguntar. Si faltan los demás, asumir defaults y avisar al usuario.

## Antes de la Fase 1: cargar contexto

**Paso 0 obligatorio:** leer en este orden:
1. `context/brand.md`
2. `context/audience.md`
3. `context/references.md`
4. `context/assets.md`
5. `context/blog.md`
6. `context/instagram.md`

Estos archivos definen voz, audiencia, palabras prohibidas, cuentas de inspiración y UUIDs de brand assets. **Todo el output del skill debe respetarlos.**

**Paso 0B — verificar brand assets:**
Revisar `context/assets.md`. Si hay UUIDs registrados (no dicen `_PENDIENTE_`), los prompts de Fase 3A los incluirán automáticamente en el parámetro `medias[]`. Si todos están pendientes, notificar al usuario:

> "⚠️ Los logos de Trichter no están subidos a Higgsfield todavía. Las imágenes se generarán con paleta y descripción textual de la marca, pero sin el logo como referencia visual. Para subirlos: compartí los archivos de logo y los subo con `media_upload`."

---

## FASE 1 — RESEARCH

**Objetivo:** detectar formatos y ángulos que están funcionando en LinkedIn entre referentes (no para copiar contenido, sino para inspirar estructura) y combinarlo con contexto sectorial sobre el tema solicitado.

### Sub-fase 1A: Web search sectorial + blog Trichter

**1A-1 Blog propio (prioridad alta):** intentar fetch de artículos en `context/blog.md` relacionados con el tema. Los datos propios de Trichter tienen mayor credibilidad que benchmarks del sector. Si algún artículo es accesible, extraer datos concretos y marcarlos como "(dato propio Trichter)".

**1A-2 Web search externo:** búsqueda sobre el tema solicitado, filtrando por:
- Datos recientes (últimos 6 meses) sobre real estate LATAM
- Casos de éxito o métricas concretas
- Reportes de proptech, AMPI, AEV, CCRI Argentina, etc.

Output parcial: 5-8 bullets con hechos, datos, fuentes. Separar datos propios vs datos sectoriales.

### Sub-fase 1B: Research en LinkedIn vía Playwright

Ejecutar `scripts/linkedin-research.js` pasando como argumento el tema.

El script hace:
1. Abre Chromium con sesión persistente (`./scripts/.linkedin-session/`)
2. Si no hay sesión, pide login manual (espera hasta 90 segundos)
3. Itera sobre las cuentas de `context/references.md` con **pausas humanas** (3-7s entre acciones, 30-60s entre cuentas)
4. Toma los últimos 5 posts de cada cuenta
5. Extrae: texto del post, formato (single/carrusel), engagement aproximado, hook (primera línea)
6. Guarda raw output en `outputs/[fecha]/raw-linkedin.json`

**Resguardos críticos del script:**
- Máximo 1 corrida cada 4 horas (verificar timestamp del último run)
- Máximo 12 cuentas por corrida
- Si LinkedIn detecta automatización (checkpoint, captcha), abortar inmediatamente y avisar al usuario
- Nunca interactuar (likes, comentarios) — solo lectura

### Sub-fase 1C: Síntesis

Procesar el raw output y producir `outputs/[fecha]/research-report.md` siguiendo `templates/research-report.md`.

### 🚦 COMPUERTA DE APROBACIÓN 1

Mostrar el research-report al usuario y preguntar:
> "Acá está el research. ¿Qué ángulos te interesan que avance a conceptos? Marcá los que sí o pedime ajustes."

**No avanzar a Fase 2 sin respuesta explícita.**

---

## FASE 2 — MATRIZ DE CONCEPTOS

**Objetivo:** convertir los ángulos aprobados en una matriz dimensional de piezas concretas, antes de redactar nada.

### Dimensiones de la matriz (adaptadas a Trichter LinkedIn B2B)

| Dimensión | Opciones |
|---|---|
| **Ángulo narrativo** | Educativo / Caso con dato / Contrarian / Framework / Pregunta provocadora |
| **Formato** | Single image / Carrusel 3-5 slides |
| **Mood visual** | Técnico-limpio / Dato-impactante / Humano-cercano |
| **Pain point principal** | Lead que no convierte / Seguimiento inconsistente / Inventario detenido / Dependencia de pauta / Escalabilidad |

### Output

Tabla en `outputs/[fecha]/concept-matrix.md` siguiendo `templates/concept-brief.md`. Cada fila es una pieza candidata con:
- ID (`TC-[fecha]-001`, etc.)
- Tema
- Ángulo
- Formato
- Mood
- Pain point
- Hook propuesto (1 línea)
- Justificación (por qué esta combinación tiene sentido para esta audiencia)

### 🚦 COMPUERTA DE APROBACIÓN 2

Presentar la matriz y preguntar:
> "Estas son las piezas candidatas. ¿Cuáles producimos? Pueden ser todas, algunas, o pedirme reemplazos."

**No avanzar a Fase 3 sin selección explícita.**

---

## FASE 3 — PROMPTS + COPY

**Objetivo:** producir, para cada pieza aprobada, los assets necesarios para Higgsfield + LinkedIn + Instagram.

### Para cada pieza:

**3A — Prompts de imagen (formato JSON, listos para Higgsfield MCP):**

**PRINCIPIO CLAVE:** Higgsfield genera los **fondos**. El texto, los separadores, los botones y el logo los agrega el usuario en Canva después. Los prompts NUNCA deben pedir texto renderizado — el resultado es ilegible y no sirve.

- Modelo: `nano_banana_2` por default.
- Aspect ratio: `4:5` como default para posts LinkedIn/IG (mejor performance en feed móvil); `1:1` solo si se pide explícitamente.
- Resolución: 2K.
- **Qué pedir en cada prompt** (ver `context/brand.md` sección "Sistema gráfico"):
  - Fondo negro `#0f1014` con degradado radial warm gold en esquinas
  - Espacio negativo central completamente vacío para texto en Canva
  - S1 hook: degradado pronunciado, espacio central 60-70% vacío
  - S2-S3 contenido: degradado sutil + opcionalmente mockup de laptop centrado en mitad inferior
  - S4 CTA: degradado medio, 80% vacío
  - Singles: fondo + elemento geométrico mínimo o completamente limpio
- **NUNCA** pedir renders arquitectónicos, fotografías ambientales, personas, interiores de propiedades — ese no es el estilo visual de Trichter.
- Para carruseles: coherencia de paleta entre slides, variación solo en intensidad del gradiente y elementos opcionales.
- **Variación de fondos**: no generar el mismo gradiente en todas las piezas del batch. Rotar entre: (a) glow esquina superior-derecha, (b) glow bilateral superior, (c) transición horizontal cool→warm, (d) glow inferior + anillos concéntricos, (e) spotlight central. Esto evita que las piezas se vean idénticas al publicar en semanas consecutivas.

**3A — Brand asset references (OBLIGATORIO si assets.md tiene UUIDs):**
- Leer `context/assets.md` para obtener UUIDs de logos e Instagram registrados.
- Incluir en cada llamada `generate_image` el parámetro `medias` con máximo 2 referencias:
  - Referencia 1 (siempre): logo según fondo
    - Fondo oscuro → `simbolo-blanco-transparente` (`c3047e91-10fb-457c-b5fd-942174c1e43d`)
    - Fondo claro → `simbolo-dorado-blanco` (`ccc65308-5db0-40da-8cee-4dbeeed437c9`)
  - Referencia 2 (si disponible): post de Instagram cuyo mood coincida con la pieza
    - Ver `context/instagram.md` → elegir el post con mood técnico/dato/humano según corresponda
  - Role para ambos: `"style_reference"`
- S4 de carruseles (slide de cierre) SIEMPRE incluir logo de alto contraste + espacio negativo en esquina inferior derecha para CTA en Canva.
- Si algún UUID dice `_PENDIENTE_` o `pendiente upload`, omitir esa referencia específica (usar las que sí están confirmadas) y agregar nota en `execution-log.json`.

**3B — Copy dual: LinkedIn + Instagram (OBLIGATORIO para cada pieza):**

*LinkedIn:*
- Hook A + Hook B (variante A/B, máx 80 caracteres, sin emoji al inicio)
- Cuerpo (3-7 párrafos cortos, máx 1300 caracteres)
- CTA (pregunta abierta o call to comment, NO "agendá una llamada")
- Hashtags (4-6, mix industria + método + mercado)

*Instagram:*
- Hook (primera línea antes del "más", máx 125 caracteres, puede ser más directo que LI)
- Copy corto (párrafos 1-2 líneas, flechas → como estructura, 1-2 emojis estructurales, máx 800 caracteres)
- CTA de comentario ("Comenta X", "Guarda esto", o pregunta corta con 👇)
- Hashtags (8-12, incluir siempre #TrichterConsulting)

*Instrucción Canva por pieza:*
Para cada pieza, incluir una instrucción específica de qué texto va en qué zona del fondo generado. Esto cierra el gap entre el fondo de Higgsfield y el post publicable.

**Voz de marca obligatoria:**
- Releer `context/brand.md` antes de redactar
- Cero buzzwords prohibidos (ver lista en brand.md)
- Datos concretos siempre que sea posible (números, %, plazos)
- Tono mentor + rebelde, directo, sin paja

### Output

`outputs/[fecha]/prompts.json` (estructurado) y `outputs/[fecha]/copies.md` (legible).

### 🚦 COMPUERTA DE APROBACIÓN 3 (la más crítica)

> "Acá tenés los prompts y copies. **Antes de gastar créditos de Higgsfield, revisá:**
> 1. ¿Los prompts capturan la pieza?
> 2. ¿La voz de marca está bien?
> 3. ¿Hay alguna palabra prohibida que se haya colado?
>
> Decime: aprobar todo / aprobar con ajustes / rehacer X."

**Esta es la única fase donde se gastan créditos. No avanzar sin "OK ejecutar".**

---

## FASE 4 — EJECUCIÓN HIGGSFIELD

**Objetivo:** disparar el batch via MCP y devolver URLs.

### Pasos

1. Verificar créditos disponibles en Higgsfield (llamar `Higgsfield:balance`)
2. Si los créditos no alcanzan para el batch completo, avisar y preguntar si continuar con menos piezas
3. Ejecutar generaciones una por una (no en paralelo masivo, para poder abortar si algo sale mal)
4. Para cada generación: usar `Higgsfield:generate_image` con los params de `prompts.json`
5. Loggear cada job_id en `outputs/[fecha]/execution-log.json`
6. Mostrar progreso al usuario: "1/12 listo, 2/12 listo..."

### Output

`outputs/[fecha]/results.md` con: URL de cada imagen, ID de pieza asociado, modelo usado, créditos consumidos.

---

## FASE 5 — DELIVERY

**Objetivo:** cerrar el ciclo con recomendaciones accionables, no solo con un dump de archivos.

### Output: `outputs/[fecha]/delivery.md`

Estructura:
1. **Resumen ejecutivo:** N piezas generadas, créditos usados, distribución por ángulo
2. **Galería organizada por ángulo narrativo** con preview + copy + prompt resumido
3. **Top 3 recomendados para publicar primero**, con justificación basada en:
   - Match con el ángulo más fuerte del research
   - Diversidad de pain points cubiertos
   - Mood visual diferenciado
4. **Plan de publicación sugerido**: orden, días sugeridos, espaciado
5. **Variantes A/B de hook ya redactadas** para los top 3
6. **Próximos pasos**: qué editar en Canva si aplica, qué resize hacer, cuándo hacer la próxima corrida

---

## Reglas operativas inviolables

1. **Nunca saltar una compuerta de aprobación.** Si el usuario dice "dale, generá todo de una", igual mostrar prompts antes de ejecutar — los créditos importan.
2. **Nunca usar palabras prohibidas** del `brand.md`. Si una se cuela, marcarla en rojo y proponer reemplazo.
3. **Siempre versionar outputs por fecha** (`outputs/2026-05-04/`).
4. **Siempre loggear créditos consumidos** para que el usuario pueda controlar gasto.
5. **Si Playwright falla**, no abortar el skill: ofrecer al usuario continuar solo con web search + posts de LinkedIn que él pegue manualmente (modo D del comparativo).
6. **Si LinkedIn detecta automatización**, abortar Playwright inmediatamente, NO reintentar, avisar al usuario y sugerir esperar 24-48h.

## Estructura de outputs

```
outputs/
└── 2026-05-04/
    ├── raw-linkedin.json
    ├── research-report.md
    ├── concept-matrix.md
    ├── prompts.json
    ├── copies.md
    ├── execution-log.json
    ├── results.md
    └── delivery.md
```
