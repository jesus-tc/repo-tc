# Trichter Content Research & Generation — Skill MVP

> Skill de Claude Code para generar contenido LinkedIn de Trichter Consulting.
> Pipeline de 5 fases con compuertas de aprobación humana.

## Instalación

### 1. Ubicar el skill en Claude Code

Copiar la carpeta completa `trichter-content-research/` dentro de tu directorio de skills de Claude Code. La ruta típica en Mac es:

```
~/.claude/skills/trichter-content-research/
```

### 2. Instalar dependencias de Playwright

```bash
cd ~/.claude/skills/trichter-content-research
npm init -y
npm install playwright
npx playwright install chromium
```

### 3. Agregar logos de Trichter

Copiar los 18 PNGs del logo en:

```
trichter-content-research/assets/logos/
```

(Crear la carpeta si no existe.)

### 4. Primera corrida — login a LinkedIn

La primera vez que el skill ejecute la Fase 1, se abrirá una ventana de Chromium pidiendo login manual. Tenés 90 segundos. Una vez logueado, la sesión queda guardada en `scripts/.linkedin-session/` para corridas siguientes.

**⚠️ Recomendación fuerte:** usar una cuenta de LinkedIn dedicada a research, no tu cuenta principal/profesional. LinkedIn no banea fácil pero puede limitar features si detecta automatización.

### 5. Higgsfield MCP

Ya está conectado según tu setup. El skill usa las tools `Higgsfield:generate_image` y `Higgsfield:balance` directamente.

## Cómo invocar el skill desde Claude Code

Ejemplos de prompts que disparan el skill:

```
Trichter: armemos 3 piezas sobre "speed to lead inmobiliario"
```

```
Necesito un carrusel de 4 slides para LinkedIn de Trichter sobre por qué los developers pierden leads después del clic
```

```
Generemos contenido para Trichter sobre CAC en real estate LATAM
```

## Pipeline

```
FASE 1: RESEARCH       → Playwright LinkedIn + web sectorial
       ↓ [APROBACIÓN: ángulos a avanzar]
FASE 2: MATRIZ         → Conceptos dimensionales (ángulo × formato × mood × pain)
       ↓ [APROBACIÓN: piezas a producir]
FASE 3: PROMPTS+COPY   → Prompts Higgsfield + copies LinkedIn con voz Trichter
       ↓ [APROBACIÓN CRÍTICA: revisar antes de gastar créditos]
FASE 4: EJECUCIÓN      → Higgsfield batch via MCP
FASE 5: DELIVERY       → Galería + top 3 + plan de publicación
```

## Estructura

```
trichter-content-research/
├── SKILL.md                    ← Instrucciones maestras
├── README.md                   ← Este archivo
├── context/
│   ├── brand.md                ← Voz, paleta, palabras prohibidas
│   ├── audience.md             ← ICP detallado
│   └── references.md           ← Cuentas LinkedIn, hashtags, competencia
├── templates/
│   ├── research-report.md
│   ├── concept-brief.md
│   ├── prompt-sheet.json
│   └── copy-doc.md
├── scripts/
│   └── linkedin-research.js    ← Playwright research
├── assets/
│   └── logos/                  ← (Agregar manualmente los 18 PNGs)
└── outputs/
    └── YYYY-MM-DD/             ← Cada corrida deja sus artefactos acá
```

## Resguardos operativos

1. **Cooldown de 4h entre corridas de Playwright.** Para no levantar flags en LinkedIn.
2. **Máximo 12 cuentas por corrida.** Con pausas humanas de 30-60s entre cada una.
3. **Solo lectura.** El script nunca da likes, comentarios ni interactúa.
4. **Detección automática de checkpoint.** Si LinkedIn marca actividad inusual, aborta inmediatamente.
5. **Aprobación humana antes de gastar créditos.** Fase 3 → Fase 4 requiere "OK ejecutar" explícito.
6. **Versionado por fecha.** Cada corrida queda en `outputs/YYYY-MM-DD/`.

## Limitaciones conocidas del MVP

1. **Selectores de Playwright son aproximados.** LinkedIn cambia su DOM frecuentemente. Si la primera corrida no extrae bien los posts, ajustar los selectores en `linkedin-research.js` (función `scrapePostsFromAccount`, línea con `document.querySelectorAll`).

2. **No hay programación de corridas automáticas.** El MVP corre on-demand. Si querés cron/schedule semanal, se suma en una v2.

3. **Higgsfield ejecuta secuencial.** Para batches grandes (>10 piezas) puede tardar varios minutos. El skill muestra progreso en cada paso.

4. **Texto sobre imagen no se renderiza dentro del prompt.** Nano Banana Pro puede fallar al escribir texto largo. Para títulos sobre imagen, usar Canva como paso de edición posterior.

5. **No hay handoff automático a Canva.** El MVP entrega imágenes y copy. La edición fina (texto sobre imagen, plantillas, branding fino) queda manual en Canva. Esto se puede automatizar en v2 con Canva MCP.

## Próximos pasos sugeridos (después del primer uso)

- [ ] Validar que los selectores de Playwright funcionan; ajustar si no
- [ ] Correr el skill 2-3 veces con temas distintos para encontrar fricciones
- [ ] Documentar casos donde la voz de marca falla y refinar `brand.md`
- [ ] Decidir si vale la pena automatizar el handoff a Canva (v2)
- [ ] Clonar el skill como base para el primer cliente externo

## Costos a vigilar

- **Higgsfield:** cada generación de imagen consume créditos. Para un batch típico de 3-6 piezas con carrusel, calcular ~10-25 generaciones (incluye variantes y slides).
- **Tiempo de corrida completa (research → delivery):** estimado 15-25 min con aprobaciones humanas.
- **Tiempo de Playwright research:** ~10-15 min con pausas humanas (es lento por diseño, para no levantar flags).
