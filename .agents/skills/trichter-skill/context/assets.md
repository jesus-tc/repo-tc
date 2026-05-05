# Trichter Brand Assets — Higgsfield Media UUIDs

> Fuente de verdad para los UUIDs de medias subidas a Higgsfield.
> El skill los incluye automáticamente como `medias[]` en cada llamada a `generate_image`.
> Estado: IDs reservados. Ver sección "Upload pendiente" al final.

---

## Logos principales

| Variante | Descripción | UUID Higgsfield | Rol | Estado |
|----------|-------------|-----------------|-----|--------|
| `simbolo-dorado-blanco` | Símbolo TC dorado sobre fondo blanco, cuadrado completo | `ccc65308-5db0-40da-8cee-4dbeeed437c9` | `style_reference` | ⏳ pendiente upload |
| `simbolo-dorado-blanco-v2` | Símbolo TC dorado sobre blanco, variante compacta | `c2d69858-350d-481e-8786-2b35c452a813` | `style_reference` | ⏳ pendiente upload |
| `simbolo-horizontal-dorado` | Símbolo dorado alineado a izquierda, fondo blanco | `ef8453f6-7990-46fb-8caf-9f5200288f9f` | `style_reference` | ⏳ pendiente upload |
| `simbolo-blanco-transparente` | Símbolo blanco sobre fondo transparente (para fondos oscuros) | `c3047e91-10fb-457c-b5fd-942174c1e43d` | `style_reference` | ⏳ pendiente upload |

---

## Regla de selección de logo

- **Fondo oscuro** (`#0f1014`, negro, gris oscuro): usar `simbolo-blanco-transparente` → `c3047e91-10fb-457c-b5fd-942174c1e43d`
- **Fondo claro** (`#ffffff`, blanco, gris claro): usar `simbolo-dorado-blanco` → `ccc65308-5db0-40da-8cee-4dbeeed437c9`
- **S4 de carrusel** (slide de cierre/CTA): siempre usar el logo de mayor contraste + espacio negativo en esquina inferior derecha

---

## Referencias visuales — Instagram

| Descripción | UUID Higgsfield | Rol | Estado |
|-------------|-----------------|-----|--------|
| Post Instagram referencia 1 (carrusel de datos) | _pendiente upload_ | `style_reference` | — |
| Post Instagram referencia 2 (single tipográfico) | _pendiente upload_ | `style_reference` | — |
| Post Instagram referencia 3 | _pendiente upload_ | `style_reference` | — |
| Post Instagram referencia 4 | _pendiente upload_ | `style_reference` | — |

> Para agregar posts de Instagram como references: compartirlos con Claude y se suben con el mismo flujo.

---

## Cómo usar en generate_image

```json
{
  "medias": [
    {
      "uuid": "c3047e91-10fb-457c-b5fd-942174c1e43d",
      "role": "style_reference"
    }
  ]
}
```

---

## Upload pendiente — instrucciones

Los 4 UUIDs de logo están reservados. Para completar el registro:

1. Renombrar los archivos de logo exactamente así:
   - `trichter-logo-simbolo-dorado-blanco.png`
   - `trichter-logo-simbolo-dorado-blanco-v2.png`
   - `trichter-logo-horizontal-dorado.png`
   - `trichter-logo-blanco-transparente.png`

2. Correr el script (válido por 24h desde generación):
   ```bash
   chmod +x outputs/assets/upload-logos.sh
   cd /ruta/donde/están/los/logos
   bash /ruta/al/repo/outputs/assets/upload-logos.sh
   ```

3. Después del upload, decirle a Claude: "logos subidos" → hace `media_confirm` para cada UUID y actualiza el estado a ✅.

---

## Estado checklist

- [ ] `simbolo-dorado-blanco` — upload + confirm
- [ ] `simbolo-dorado-blanco-v2` — upload + confirm
- [ ] `simbolo-horizontal-dorado` — upload + confirm
- [ ] `simbolo-blanco-transparente` — upload + confirm
- [ ] Posts de Instagram — upload + confirm
