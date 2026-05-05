# Trichter Instagram — Referencias Visuales

> Posts de @trichter.consulting como referencia de estilo para generaciones Higgsfield.

## Cuenta

https://www.instagram.com/trichter.consulting/

---

## Sistema visual confirmado (análisis post DJILXvrx8Kb)

### Patrones observados

**Fondo:** negro `#0f1014` con degradado radial warm gold en esquinas. El degradado es más fuerte en slides de hook, más sutil en slides de contenido.

**Tipografía:** sans-serif extrabold uppercase blanca para keywords grandes. Italic bold para nombres. Tamaños contrastados — la palabra clave principal ocupa ~50% del ancho.

**Estructura del carrusel (5 slides):**
1. **Cover/hook:** pregunta en regular pequeño + keyword enorme uppercase + botón borde dorado + chevrons swipe
2-4. **Slides de herramienta:** nombre en italic + línea dorada + descripción bold/regular + laptop mockup centrado + chevrons
5. **CTA/cierre:** pregunta bold grande + línea dorada + subtítulo italic + chevron down

**Elementos decorativos recurrentes:** cursor animado, chevrons `>>>>>`, líneas doradas, puntos de paginación

**Lo que NO está:** fotografías de personas, renders arquitectónicos, fondos degradados de colores (solo negro + warm gold)

---

## Media IDs para style_reference en Higgsfield

| Slide | Descripción | UUID | Estado |
|-------|-------------|------|--------|
| Cover hook | "¿Te imaginás escalar tu inmobiliaria con IA?" — texto grande + botón dorado | `4ca2f38e-48df-483b-a58a-4fd866e0dbc2` | ⏳ pendiente upload |
| CTA final | "¿Quieres convertir estas herramientas en ventas?" — texto centrado + línea dorada | `8a6823bc-46fa-4d31-b6e4-8d0feb38e371` | ⏳ pendiente upload |
| Herramienta 1 | Styldod — italic + laptop mockup + gradiente | `f44b3a7a-0dd0-4b2e-be1f-54754a2bb45d` | ⏳ pendiente upload |
| Herramienta 2 | Collov AI — mismo sistema visual | `9e44c33c-0a2c-416e-b301-755d948709f4` | ⏳ pendiente upload |
| Hook fullscreen | Versión full del cover sin UI de Instagram | `dc5f2271-5270-4eb4-bdea-09bf26e179ad` | ⏳ pendiente upload |

---

## Uso en generate_image

Para el próximo batch usar `dc5f2271-5270-4eb4-bdea-09bf26e179ad` (hook fullscreen) como referencia principal — es la slide más limpia y representativa del sistema visual:

```json
{
  "medias": [
    { "uuid": "c3047e91-10fb-457c-b5fd-942174c1e43d", "role": "style_reference" },
    { "uuid": "dc5f2271-5270-4eb4-bdea-09bf26e179ad", "role": "style_reference" }
  ]
}
```

> Logo blanco sobre transparente (`c3047e91`) + slide hook fullscreen como doble referencia.
> Máximo 2 referencias para no diluir coherencia.

---

## Checklist upload

- [ ] `trichter-ig-cover-hook.jpg` → UUID `4ca2f38e`
- [ ] `trichter-ig-slide-cta-final.jpg` → UUID `8a6823bc`
- [ ] `trichter-ig-slide-herramienta-1.jpg` → UUID `f44b3a7a`
- [ ] `trichter-ig-slide-herramienta-2.jpg` → UUID `9e44c33c`
- [ ] `trichter-ig-slide-hook-fullscreen.jpg` → UUID `dc5f2271`
