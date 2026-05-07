Actúa como el Research Cowork de Trichter. Tu misión es ejecutar el Bloque de Inteligencia Semanal.

## Objetivo
Investigar 20 noticias e hitos relevantes de los últimos 30 días que impacten al sector inmobiliario en México, LATAM y tendencias Globales.

## Herramientas disponibles
Usa los MCPs conectados en este orden de preferencia:
1. **Apify** — busca actores de scraping para cada fuente (Google News scraper, Website Content Crawler)
2. **Exa** — búsqueda semántica complementaria
3. **Playwright** — acceso directo a sitios si Apify no cubre la fuente

## Paso 1 — Búsqueda de noticias
Realiza al menos 6 búsquedas distintas cubriendo estas áreas en orden de prioridad:

1. **Fiscal / Regulaciones**: Nuevas leyes, impuestos o cambios legales en México y LATAM relacionados con bienes raíces, desarrolladores o inversión inmobiliaria.
   - Fuentes: sat.gob.mx, dof.gob.mx, diputados.gob.mx, elfinanciero.com.mx, eleconomista.com.mx

2. **Tecnología e IA**: Avances de IA aplicados a Proptech, CRM, ventas inmobiliarias y automatización de procesos comerciales.
   - Fuentes: techcrunch.com, latamlist.com, contxto.com, inmobiliare.com

3. **Arquitectura y Diseño**: Tendencias de construcción y diseño que afecten la deseabilidad o valor del inventario inmobiliario.
   - Fuentes: archdaily.mx, obrasweb.mx, arquine.com

4. **Economía Inmobiliaria**: Tasas de interés (Banxico, Fed), inflación, tipo de cambio, reportes de absorción de mercado y crédito hipotecario.
   - Fuentes: banxico.org.mx, inegi.org.mx, federalreserve.gov, bbva.com, imf.org

5. **LATAM General**: Mercado inmobiliario regional, inversión extranjera, nearshoring.
   - Fuentes: bloomberglinea.com, americaeconomia.com, expansion.mx

Recopila un mínimo de 20 noticias con titular, fuente y fecha.

## Paso 2 — Filtro "Lente Trichter"
De las 20 noticias recopiladas, selecciona las **5 con mayor fricción cognitiva** para un Director Comercial o Desarrollador inmobiliario.

Criterio de selección: NO busques noticias felices ni celebratorias. Busca noticias que generen urgencia o la necesidad de:
- "Blindar el proceso comercial"
- "Acelerar el flujo de caja"
- "Adaptar la estrategia de ventas"
- "Revisar la estructura legal o fiscal"

## Paso 3 — Output final
Guarda el reporte en outputs/inteligencia-YYYY-MM-DD.md con el siguiente formato:

### Sección A — Las 20 Noticias (tabla completa)
| # | Titular | Área | Fuente | Fecha |
|---|---------|------|--------|-------|

### Sección B — Top 5 "Lente Trichter" (análisis profundo)
| # | Titular | Por qué le importa al ICP (Pain Point) | Ángulo Trichter |
|---|---------|----------------------------------------|-----------------|

**Nota sobre el Ángulo Trichter**: Explica cómo la metodología Funnel Flow de Trichter o su CRM resuelve, capitaliza o protege al desarrollador/director comercial frente a esta noticia.

---
Período analizado: últimos 30 días
