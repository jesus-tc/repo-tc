# Trichter Instagram — Referencias Visuales

> Posts de Instagram de Trichter como referencia de estilo visual para generaciones Higgsfield.
> Objetivo: consistencia entre el contenido orgánico de IG y LinkedIn.

## Cuenta

https://www.instagram.com/trichterconsulting/

---

## Posts de referencia registrados

> Subir posts como media en Higgsfield y registrar UUIDs en context/assets.md.
> Formato: PNG o JPG de alta resolución (4:5 o 1:1), las mismas dimensiones en que se publican.

| ID | Descripción visual | Formato | UUID Higgsfield | Notas |
|----|-------------------|---------|-----------------|-------|
| IG-ref-001 | — | carrusel | pendiente | — |
| IG-ref-002 | — | single | pendiente | — |
| IG-ref-003 | — | carrusel | pendiente | — |
| IG-ref-004 | — | single | pendiente | — |

---

## Guía de uso en Phase 3A

Cuando los UUIDs estén registrados en `assets.md`, el skill puede incluir 1 post de Instagram como `style_reference` adicional al logo:

```json
{
  "medias": [
    { "uuid": "UUID_LOGO", "role": "style_reference" },
    { "uuid": "UUID_IG_POST", "role": "style_reference" }
  ]
}
```

**Regla:** No usar más de 2 referencias visuales simultáneas (logo + 1 post). Más referencias compiten entre sí y diluyen la coherencia.

**Selección del post de referencia:** elegir el post cuyo mood (técnico-limpio vs dato-impactante vs humano) coincida con el de la pieza a generar.

---

## Elementos visuales observados en posts actuales

> Completar después de revisar los posts compartidos.

- Fondo predominante: negro `#0f1014` con texto en blanco y acento dorado
- Tipografía: Poppins o similar, bold para datos, regular para cuerpo
- Composición: datos grandes centrados, logo en esquina inferior
- No usar fotografías de personas en todos los posts — hay mix de tipográfico y fotográfico
