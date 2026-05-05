# Trichter Brand Assets — Higgsfield Media UUIDs

> Fuente de verdad para los UUIDs de medias subidas a Higgsfield.
> El skill los incluye automáticamente como `medias[]` en cada llamada a `generate_image`.
> Para registrar nuevos assets: subir con `media_upload` y agregar el UUID aquí.

---

## Logos principales

| Variante | Descripción | UUID Higgsfield | Rol en generate_image |
|----------|-------------|-----------------|----------------------|
| logo-negro-dorado | Símbolo + texto sobre fondo negro | _PENDIENTE_ | `style_reference` |
| logo-blanco | Símbolo + texto sobre fondo blanco | _PENDIENTE_ | `style_reference` |
| simbolo-solo-dorado | Solo el símbolo sin texto | _PENDIENTE_ | `style_reference` |
| simbolo-solo-blanco | Solo el símbolo sin texto, fondo negro | _PENDIENTE_ | `style_reference` |

---

## Cómo subir nuevos assets

```
# Desde Claude Code, usar la herramienta MCP Higgsfield:
mcp__higgsfield__media_upload(file_path="/ruta/al/logo.png")
# → devuelve { uuid: "xxxx-...", url: "..." }
# Agregar el UUID a la tabla de arriba
```

---

## Cómo usar en generate_image

Cuando `assets.md` tiene UUIDs registrados, Phase 3 debe incluir el parámetro `medias` en cada llamada:

```json
{
  "medias": [
    {
      "uuid": "UUID_DEL_LOGO_NEGRO_DORADO",
      "role": "style_reference"
    }
  ]
}
```

**Regla de selección de logo:**
- Si el fondo de la imagen es oscuro (`#0f1014` o variantes): usar `logo-blanco` o `simbolo-solo-blanco`
- Si el fondo es claro (`#ffffff` o variantes): usar `logo-negro-dorado` o `simbolo-solo-dorado`
- Para slides de carrusel S4 (cierre/CTA): siempre incluir el logo de mayor contraste con el fondo

---

## Referencias visuales adicionales

| Nombre | Descripción | UUID Higgsfield | Rol |
|--------|-------------|-----------------|-----|
| _vacío_ | Agregar ejemplos de piezas aprobadas para style reference | — | `style_reference` |

---

## Estado de registro

- [ ] logo-negro-dorado subido y UUID registrado
- [ ] logo-blanco subido y UUID registrado
- [ ] simbolo-solo-dorado subido y UUID registrado
- [ ] simbolo-solo-blanco subido y UUID registrado

**Instrucción para el skill:** Si `_PENDIENTE_` aparece en la tabla, omitir el parámetro `medias` en esa generación y notificar al usuario que faltan subir los logos.
