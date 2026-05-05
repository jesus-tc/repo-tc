# Trichter Blog — Fuente de Datos para Copies

> El skill debe consultar este archivo en Fase 1A y Fase 3B para anclar copies en datos propios.
> Los artículos del blog son la fuente de verdad sobre qué ha dicho Trichter públicamente.

## URL base

https://trichterconsulting.com/blog/

> Nota: el blog puede requerir WebFetch directo a cada URL de artículo (el índice devuelve 403).
> Estrategia: intentar fetch de artículos conocidos listados abajo. Si falla, usar datos de copies previos.

---

## Artículos conocidos

> Completar con URLs reales al hacer el primer scrape exitoso.

| Tema | URL | Datos/Citas clave | Usado en |
|------|-----|-------------------|----------|
| Speed-to-lead | — | 917 min promedio industria, 1% responde en 5 min | TC-001 |
| CAC y proceso comercial | — | CAC -41% en 45 días, speed-to-lead 4.2h→5min | TC-006 |
| Pipeline dormido en CRM | — | $58.5M en CRM, 68% leads sin 2do contacto | TC-007 |
| Show rate inmobiliario | — | benchmark 10-23%, caso 20%→60% con IA | TC-003 |

---

## Instrucción para Phase 1A

Al hacer research web sectorial, intentar también:
```
WebFetch("https://trichterconsulting.com/blog/[slug-del-articulo-relevante]")
```

Si el artículo existe y es accesible, extraer:
- Datos numéricos concretos (% mejora, tiempos, costos)
- Frases que ya usó Trichter públicamente (para coherencia de voz)
- Casos de clientes mencionados (sin nombre si es confidencial)

---

## Instrucción para Phase 3B — Copy

Cuando haya datos del blog disponibles:
1. Priorizar esos datos sobre datos genéricos del sector
2. Marcar la fuente: "(dato propio Trichter)" vs "(benchmark sector)"
3. Los datos propios tienen mayor credibilidad para el ICP porque son verificables

---

## Cómo agregar artículos nuevos

Cuando un artículo sea accesible via WebFetch:
1. Agregar fila a la tabla de arriba con URL y datos clave
2. Commitear a `context/blog.md`
3. El skill los verá automáticamente en el próximo run
