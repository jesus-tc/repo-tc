# Trichter Blog — Fuente de Datos para Copies

> El skill debe consultar este archivo en Fase 1A y Fase 3B para anclar copies en datos propios.
> Los artículos del blog son la fuente de verdad sobre qué ha dicho Trichter públicamente.

## URL base

https://trichterconsulting.com/blog/

> Nota: el blog puede requerir WebFetch directo a cada URL de artículo (el índice devuelve 403).
> Estrategia: intentar fetch de artículos conocidos listados abajo. Si falla, usar datos de copies previos.

---

## Artículos conocidos

> URLs con 403 al hacer fetch automático. Poblar manualmente con datos de cada artículo.
> Fuente alternativa verificada: https://trichterconsulting.com/leads-inmobiliarios-guia-estrategica/

| Tema | URL | Datos/Citas clave | Usado en |
|------|-----|-------------------|----------|
| Speed-to-lead | — | 917 min promedio industria, 1% responde en 5 min | TC-001 (batch mayo) |
| CAC y proceso comercial | — | CAC -41% en 45 días, speed-to-lead 4.2h→5min | TC-006 (batch mayo) |
| Pipeline dormido en CRM | — | $58.5M en CRM, 68% leads sin 2do contacto | TC-007 (batch mayo) |
| Show rate inmobiliario | — | benchmark 10-23%, caso 20%→60% con IA | TC-003 (batch mayo) |
| Automatización leads | — | 8%→13% conversión sin tocar pauta; 3.2h→5min respuesta; 68% sin 2do contacto | TC-A-005 (batch automatización) |
| Leads inmobiliarios guía | https://trichterconsulting.com/leads-inmobiliarios-guia-estrategica/ | CPL $5-15 bruto / $35-60 calificado | TC-A-001 |

## Datos del sector con fuente verificada (para uso en copies)

| Dato | Fuente | Usado en |
|------|--------|----------|
| 71% leads sin segunda llamada | promedio sector (Andrés Ospina, 2025) | TC-A-001 |
| -50% prob. cierre c/30 min sin respuesta | comportamiento documentado comprador | TC-A-003 |
| Solo 23% inmobiliarias LATAM usa IA | CREW Network 2024 | TC-A-004 |
| 80 contactos = límite gestión humana activa | neurociencia / gestión comercial | TC-A-002 |
| CRM aumenta conversiones hasta 29% | Salesforce 2025 | referencia general |
| LATAM proptech CAGR 11.4% hasta 2034 | CoherentMarket 2025 | contexto sectorial |

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
