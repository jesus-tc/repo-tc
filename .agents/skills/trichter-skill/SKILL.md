---
name: trichter-content-research
description: Use this skill when the user wants to generate organic content for Trichter Consulting (real estate growth partner LATAM) for LinkedIn and/or Instagram. Triggers on requests like "armemos contenido para Trichter", "necesito posts para LinkedIn de Trichter", "creemos posts para Instagram", "research de tendencias inmobiliarias", "creemos un carrusel sobre [tema]", or "generemos un batch de imágenes para Higgsfield". The skill orchestrates a 5-phase pipeline with human approval gates: research (Playwright + web), concept matrix, prompt + copy generation (LinkedIn + Instagram), Higgsfield batch execution, and delivery with A/B recommendations and Canva guide. Designed for Spanish (neutral LATAM) B2B content targeting real estate developers in Mexico, Argentina, and Uruguay.
---

# Trichter Content Research & Generation Skill

Pipeline orquestado de 5 fases con compuertas de aprobación humana entre cada una.
**NUNCA saltar fases. NUNCA ejecutar Higgsfield sin aprobación explícita de prompts.**

---

## Parámetros a extraer del prompt

Identificar antes de empezar (preguntar solo lo que falte):

1. **Tema o ángulo de research** (obligatorio — preguntar si falta)
2. **Redes objetivo** (default: LinkedIn + Instagram)
3. **Cantidad de piezas** (default: 5)
4. **Mix carrusel/single** (default: 40% carrusel / 60% single)
5. **Largo de carrusel** (default: 4 slides)
6. **Audiencia primaria** (default: Segmento A — developers medianos LATAM)

Si faltan los parámetros opcionales, asumir defaults y avisarlo.

---

## PASO 0 — Cargar contexto y verificar assets

**Leer en este orden antes de cualquier fase:**
1. `context/brand.md` — voz, paleta, sistema gráfico, palabras prohibidas
2. `context/audience.md` — ICP detallado, pain points, cómo escribir para ellos
3. `context/references.md` — cuentas de referencia para LinkedIn research
4. `context/assets.md` — UUIDs de logos e imágenes de IG en Higgsfield
5. `context/blog.md` — datos propios de Trichter y artículos accesibles
6. `context/instagram.md` — sistema visual IG y media IDs de estilo

**Verificar brand assets (assets.md):**
- Si hay UUIDs confirmados (sin `⏳`): incluirlos en `medias[]` de cada generación
- Si todos están pendientes: notificar al usuario antes de la Fase 3

> ⚠️ Los logos de Trichter no están subidos a Higgsfield todavía. Las imágenes se generarán con descripción textual de la paleta, sin el logo como referencia visual. Para activarlo: correr `outputs/assets/upload-all.sh` y confirmar aquí.

---

## FASE 1 — RESEARCH

**Objetivo:** datos concretos del sector + patrones de formato que funcionan entre referentes.

### 1A — Web search: blog Trichter primero, sector después

**1A-1 Blog propio (máxima prioridad):**
Revisar `context/blog.md` → si hay URLs accesibles relacionadas con el tema, hacer WebFetch. Los datos propios de Trichter son más creíbles que benchmarks genéricos. Marcar cada dato como `(dato propio Trichter)` vs `(benchmark sector)`.

**1A-2 Web search externo:**
Buscar datos sobre el tema en real estate LATAM. Filtrar por:
- Últimos 6 meses
- Métricas concretas (%, tiempos, costos, tasas)
- Fuentes: proptech, AMPI, AEV, CCRI Argentina, Salesforce, reportes de CRM

Output: 5-8 bullets con dato + fuente + relevancia para el ICP de Trichter.

### 1B — LinkedIn research vía Playwright

Verificar primero: ¿existe `scripts/.last-run.json` con timestamp de menos de 4 horas? Si sí, saltar 1B y usar el raw-linkedin.json existente.

Si no, ejecutar:
```bash
node scripts/linkedin-research.js "[tema]"
```

**Si el script falla o no está configurado localmente:**
No abortar el skill. Ofrecer al usuario dos opciones:
> "No puedo correr Playwright en este entorno. Podemos continuar de dos formas:
> A) Pegame 3-5 posts de LinkedIn de referentes que hayas visto recientemente y los proceso yo.
> B) Avanzo directo con el research web — sin datos de LinkedIn pero con los datos sectoriales."

Continuar con lo que haya disponible. La Fase 1B es útil pero no bloqueante.

**Resguardos si el script corre:**
- Máximo 12 cuentas por corrida, 1 corrida cada 4 horas
- Si LinkedIn detecta automatización (captcha, checkpoint): abortar, NO reintentar, avisar, sugerir esperar 24-48h
- Solo lectura — nunca likes, comentarios ni mensajes

### 1C — Síntesis

Producir `outputs/[fecha]-[tema]/research-report.md` con:
- Datos sectoriales encontrados (separados: propios Trichter vs sector)
- Patrones de formato detectados en LinkedIn (si 1B corrió)
- 5-8 ángulos candidatos con pain point, formato sugerido y hook propuesto

### 🚦 COMPUERTA 1

> "Aquí está el research. ¿Qué ángulos avanzan a conceptos? Marca los que sí o pide ajustes."

---

## FASE 2 — MATRIZ DE CONCEPTOS

**Objetivo:** antes de redactar una palabra, definir exactamente qué pieza produce qué resultado.

### Dimensiones

| Dimensión | Opciones |
|-----------|----------|
| **Ángulo narrativo** | Educativo / Caso con dato / Contrarian / Framework / Pregunta provocadora |
| **Formato** | Single / Carrusel 3-5 slides |
| **Mood visual** | Técnico-limpio / Dato-impactante / Humano-cercano |
| **Pain point** | Lead sin convertir / Seguimiento inconsistente / Inventario detenido / Dependencia de pauta / Escalabilidad |
| **Red recomendada** | LinkedIn / Instagram / Ambas |

**Criterio para Red recomendada:**
- LinkedIn: ángulos educativos largos, frameworks, casos con dato detallado — audiencia Segmento A (directores)
- Instagram: datos impactantes visuales, preguntas provocadoras cortas, contrarian — audiencia más amplia
- Ambas: casi siempre la respuesta correcta para piezas de alto impacto

### Output

Tabla en `outputs/[fecha]-[tema]/concept-matrix.md`. Cada fila:
`ID | Tema | Ángulo | Formato | Mood | Pain point | Red | Hook propuesto | Justificación`

### 🚦 COMPUERTA 2

> "Estas son las piezas candidatas. ¿Cuáles producimos? Todas / algunas / con reemplazos."

---

## FASE 3 — PROMPTS + COPY

**Objetivo:** para cada pieza aprobada, generar todos los assets listos para ejecutar y publicar.

### 3A — Prompts de imagen (Higgsfield)

**PRINCIPIO FUNDAMENTAL:** Higgsfield genera los **fondos**. El texto, logo, separadores y botones van en Canva. Los prompts NUNCA deben pedir texto renderizado.

**Modelo y formato:**
- Modelo: `nano_banana_2` (default) — `soul_2` solo si la pieza requiere persona real
- Aspect ratio: `4:5` (default, óptimo para feed móvil LI + IG) — `1:1` solo si se pide
- Resolución: 2K

**Qué generar según tipo de slide** (ver sistema gráfico en `context/brand.md`):

| Slide | Prompt base | Espacio para Canva |
|-------|-------------|-------------------|
| S1 Hook | Fondo negro + degradado dorado pronunciado en esquinas | 60-70% centro vacío |
| S2-S3 Contenido | Fondo negro + degradado sutil + mockup laptop opcional en mitad inferior | 65% superior vacío |
| S4 CTA | Fondo negro + arco de luz dorado superior | 80% centro-inferior vacío |
| Single | Fondo negro + degradado según mood de la pieza | 65% centro vacío |

**Variación obligatoria de fondos por batch** — rotar entre estas 5 variantes para que las piezas no sean idénticas:
1. Glow esquina superior-derecha (dominante)
2. Glow bilateral — ambas esquinas superiores
3. Transición horizontal cool-to-warm (azul oscuro→dorado)
4. Glow inferior + anillos concéntricos dark-on-dark
5. Spotlight central desde arriba

**NUNCA:** renders arquitectónicos, fotografías, personas, interiores de propiedades.

**Brand asset references** (si UUIDs confirmados en `assets.md`):
- Máximo 2 referencias por generación
- Ref 1 (logo): fondo oscuro → `c3047e91` / fondo claro → `ccc65308`
- Ref 2 (IG post): elegir de `instagram.md` el que coincida con el mood de la pieza
- Role: `"style_reference"` para ambos
- Si UUID dice `⏳`: omitir esa referencia y anotar en execution-log

### 3B — Copy LinkedIn + Instagram (OBLIGATORIO para cada pieza)

**LinkedIn:**
- Hook A + Hook B (máx 80 caracteres, sin emoji al inicio)
- Cuerpo (3-7 párrafos cortos, máx 1300 caracteres totales)
- CTA (pregunta abierta o call to comment — NO venta directa)
- Hashtags (4-6: industria + método + mercado)

**Instagram:**
- Hook (primera línea antes del "más" — máx 125 caracteres)
- Caption corta (párrafos de 1-2 líneas, flechas → como estructura, máx 800 caracteres)
  - Para carruseles: la caption es el texto del post, NO el contenido de cada slide. El contenido de los slides va en la guía Canva.
- CTA de comentario: "Comenta X", "Guarda esto", o pregunta corta + 👇
- Hashtags (8-12, siempre incluir `#TrichterConsulting`)

**Guía Canva por pieza** (incluir en copies.md):
Especificar para cada imagen qué va en qué zona:
- Zona superior: [texto principal / dato bold / pregunta hook]
- Zona central: [cuerpo / puntos clave / vacío]
- Zona inferior: [CTA / logo Trichter esquina inferior derecha / línea separadora dorada]

**Voz de marca:**
- Releer `context/brand.md` antes de redactar
- Cero buzzwords prohibidos — si aparece uno, marcarlo y reemplazarlo
- Datos concretos siempre que sea posible
- Neutro LATAM: sin voseo (tenés→tienes, podés→puedes, sabés→sabes)
- Tono mentor + rebelde, directo, sin paja

### Output Fase 3

- `outputs/[fecha]-[tema]/prompts.json`
- `outputs/[fecha]-[tema]/copies.md` (siguiendo `templates/copy-doc.md`)

### 🚦 COMPUERTA 3 — la más crítica

> "Aquí están los prompts y copies. Antes de gastar créditos de Higgsfield, revisar:
> 1. ¿Los prompts capturan el fondo correcto para cada pieza?
> 2. ¿La voz de marca está bien en LinkedIn e Instagram?
> 3. ¿Hay alguna palabra prohibida?
> 4. ¿Las guías de Canva son claras?
>
> Responder: **aprobar todo / aprobar con ajustes / rehacer [pieza X]**."

**Esta es la única fase que gasta créditos. No ejecutar sin aprobación.**

---

## FASE 4 — EJECUCIÓN HIGGSFIELD

**Objetivo:** disparar el batch via MCP, loggear resultados y créditos.

### Pasos

1. Verificar créditos: `Higgsfield:balance` → si no alcanzan para el batch completo, avisar y preguntar si continuar con subset
2. Registrar créditos iniciales
3. Ejecutar generaciones **una por una** (permite abortar si algo sale mal)
4. Para cada generación: `Higgsfield:generate_image` con params de `prompts.json`
5. Mostrar progreso: "1/11 lista ✓", "2/11 lista ✓"...
6. Al terminar: obtener URLs con `job_display`

### Execution log (`outputs/[fecha]-[tema]/execution-log.json`)

```json
{
  "batch": "[tema] — [fecha]",
  "brand_assets_active": false,
  "creditos_inicio": 0,
  "creditos_fin": 0,
  "creditos_consumidos": 0,
  "generaciones": [
    {
      "pieza_id": "TC-X-001",
      "slide": "S1",
      "job_id": "uuid",
      "status": "completed",
      "url": "https://...",
      "medias_usados": []
    }
  ],
  "notas": []
}
```

---

## FASE 5 — DELIVERY

**Objetivo:** entregar un paquete accionable — no solo URLs sino instrucciones para publicar.

### Output: `outputs/[fecha]-[tema]/delivery.md`

**Estructura obligatoria:**

1. **Resumen ejecutivo** — piezas, imágenes, créditos consumidos, estado brand assets

2. **Galería por pieza** — para cada pieza:
   - Hook recomendado
   - URL(s) de imagen(es)
   - Copy LinkedIn (truncado a hook + primeras 2 líneas)
   - Copy Instagram (ídem)
   - **Guía Canva** — instrucciones específicas zona por zona:
     ```
     Zona superior: [qué texto, qué tamaño, qué peso]
     Zona central:  [qué texto o vacío]
     Zona inferior: [logo Trichter esquina inferior derecha + CTA]
     Separadores:   [dónde va la línea dorada]
     ```

3. **Top 3 para publicar primero** — justificación basada en:
   - Dato más impactante / verificable por el ICP
   - Diversidad de ángulos
   - Balance LI vs IG

4. **Plan de publicación** — tabla con: Semana / Red / Día / Pieza / Formato
   - Mínimo 3 días entre publicaciones en la misma red
   - Carruseles de caso separados por al menos 2 semanas
   - Alternar singles y carruseles

5. **Variantes A/B de hook** — para los top 3, en ambas versiones (LI + IG)

6. **Próximos pasos**:
   - Checklist Canva por pieza
   - Estado de brand assets y cómo activarlos si están pendientes
   - Tema sugerido para el próximo batch (basado en lo que no se cubrió en este)

---

## Reglas operativas inviolables

1. **Nunca saltar una compuerta.** Si el usuario dice "dale todo de una vez", igual mostrar prompts antes de ejecutar.
2. **Nunca usar palabras prohibidas** de `brand.md`. Si aparece una, marcarla con ⚠️ y proponer reemplazo.
3. **Neutro LATAM siempre.** Sin voseo en ningún output (copies, delivery, mensajes al usuario).
4. **Versionar outputs** en `outputs/[fecha]-[tema-slug]/` — ej: `outputs/2026-05-05-automatizacion/`
5. **Siempre loggear créditos** — inicio y fin de Fase 4.
6. **Si Playwright falla**, no abortar — ofrecer opciones A/B al usuario (ver Fase 1B).
7. **Si LinkedIn detecta automatización**, abortar Playwright inmediatamente, NO reintentar.

## Estructura de outputs

```
outputs/
└── 2026-05-05-automatizacion/
    ├── research-report.md
    ├── raw-linkedin.json        ← si Playwright corrió
    ├── concept-matrix.md
    ├── prompts.json
    ├── copies.md                ← LinkedIn + Instagram + guía Canva por pieza
    ├── execution-log.json       ← job IDs + créditos + URLs
    └── delivery.md              ← galería + top 3 + plan publicación + guía Canva
```
