# Correcciones de Axel — Batch contenidos 16-jun-2026

> Fuente: hilo de Slack "Re: Linkedin Research" (DM `D05AT40KHU5`, ts `1781365067.991779`).
> Comentarios de Axel del 17-jun-2026. Sesión guardada el 10-jul-2026.
> Estado: tarea pausada el 29-jun ("Lo vemos después de la LOM"). Pendiente aplicar estas correcciones para retomar.

## Archivos base (compartidos en Slack, NO están en el repo — batch corrido manual)

- `semana-jun16-brief-SHARE.html` (6.7 MB, file ID `F0BB6DR01QC`) → Posts del research (1–5)
- `linkedin-jun16-brief-SHARE.html` (1.9 MB, file ID `F0BB0NP2PRC`) → Posts de LinkedIn (LI 1–3)
- Contenidos aprobados por Axel del research original: **C1, C3, C4, C6, C8**

---

## `semana-jun16-brief-SHARE.html` — Posts del research

### Post 1 — 🟡 Ajuste de copy
- Dice "LATAM" pero la noticia es **exclusiva de México** → aclarar en el copy (hook y/o cuerpo) que aplica a México. El resto está OK.

### Post 2 — 🟡 Dos ajustes
- Usar el cover line sugerido: **"Tu sala de ventas cierra a las 7. Tu comprador convierte a las 10."** (regenerar/editar el cover, slide 1).
- **Agregar fuente del dato** en el slide de la estadística y en el copy (externa o "análisis interno Trichter"). Regla: dato sin fuente pierde credibilidad.

### Post 3 — 🟢 Aprobado, no tocar

### Post 4 — 🟢 Aprobado, dejar como está (Axel aceptó el cover actual)

### Post 5 — 🔴 Rehacer casi completo (PRIORITARIO)
- Quitar anonimización → usar el **caso real LAFHER** (copy + slides).
- Letras "TC" → **logo real de Trichter**. Ojo: logos aún no subidos a Higgsfield (`context/assets.md`); correr `outputs/assets/upload-all.sh` y confirmar UUIDs, o insertar en Canva a mano.
- Imagen IA del **S4** → imagen real (ej. gráfico de Carolina Cantú).
- Espacios vacíos en **S3, S5, S6, S7** → rediseñar esos slides.
- Funnel flow muy básico → apalancarse del **flujo de Encore** (ClickUp: https://app.clickup.com/9002140381/v/dc/8c93gpx-39634) + mencionar el **dashboard en tiempo real** conectado a plataformas publicitarias.

---

## `linkedin-jun16-brief-SHARE.html` — Posts de LinkedIn

### LI 1 — 🟡 Dos ajustes
- Ir con el **CTA educacional** (regla: 4 contenidos de valor × 1 de venta) — último slide + cierre del copy.
- Mejorar diseño: demasiados espacios vacíos en los slides.

### LI 2 — 🟡 Ajuste menor
- Muy bueno; solo el **último slide** tiene demasiado espacio vacío.

### LI 3 — 🟡 Ajuste puntual
- Cambiar **2024 → 2025** en el slide del dato.

---

## Corrección transversal (todos los carruseles)

Feedback repetido: **espacios vacíos sin imágenes ni texto**. Referencias de estándar que dejó Axel:

- Carrusel ejemplo: https://www.instagram.com/p/DZob6XyFn1n/
- Design skills: https://design-skills-joaco.vercel.app/

Nota: el commit `9ac8ff4` del skill ya mejora el sistema visual (dual-format copy, gradient variety) — regenerar con el skill actualizado debería mitigar esto de fábrica.

---

## Orden sugerido de ejecución

1. Fáciles (solo texto / 1 slide): Post 1, LI 3 (2024→2025), LI 2 (último slide).
2. Post 2: nuevo cover line + fuente.
3. LI 1: CTA educacional + rediseño de slides.
4. Post 5: rehacer con caso LAFHER + flujo de Encore (leer doc de ClickUp antes) + subir logos a Higgsfield si se regenera ahí.
