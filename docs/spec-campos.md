# Especificación de campos — Cotizador Web

## Inventario de campos (T1.1)

### Encabezado — Datos de la empresa (fijos)

| Campo | Tipo | Notas |
|-------|------|-------|
| Nombre empresa | Fijo | "NEW POWER ENERGY SAS" |
| NIT empresa | Fijo | "901826285-6" |
| Dirección | Fijo | "VILLAVICENCIO-META" |
| Teléfono | Fijo | "(57) 3204931541" |
| Logotipo | Fijo | Logo embebido como asset |

### Encabezado — Datos de la cotización

| Campo | Tipo | Notas |
|-------|------|-------|
| Número de cotización | Dinámico | Formato `C-1-{correlativo}`. Sugerido auto (siguiente del último guardado). Editable manualmente. Semilla inicial: 118. |
| Fecha de emisión | Dinámico | ISO date (yyyy-mm-dd). Default: hoy. |
| Validez (días) | Dinámico | Número entero > 0. Default: 15. |
| Fecha de vencimiento | Calculado (informativo) | = fechaEmisión + validezDías. No es campo editable. |

### Datos del cliente

| Campo | Tipo | Notas |
|-------|------|-------|
| Nombre | Dinámico (obligatorio) | String no vacío |
| NIT | Dinámico (obligatorio) | String con formato básico: dígitos, guion opcional, dígito de verificación |
| Ciudad | Dinámico (opcional) | String libre |
| Contacto | Dinámico (opcional) | String libre |
| Teléfono | Dinámico (opcional) | String libre |
| Vendedor | Dinámico (opcional) | String libre. Trazabilidad interna. |

### Ítems de la cotización (lista dinámica)

| Campo | Tipo | Notas |
|-------|------|-------|
| N.º ítem | Fijo (auto) | Numeración automática 1, 2, 3… |
| Descripción | Dinámico (obligatorio) | Texto |
| Cantidad | Dinámico (obligatorio) | Número > 0 |
| Valor unitario | Dinámico (obligatorio) | Número >= 0, en COP |
| Impuesto % | Dinámico (obligatorio) | Número 0–100. Default: 19. Permitir distinto por ítem. |
| Vr. Bruto | Calculado | = cantidad × valorUnitario. Se actualiza en tiempo real. |

### Totales

| Campo | Tipo | Notas |
|-------|------|-------|
| Total Bruto | Calculado | Σ bruto de todos los ítems |
| Descuento % | Fijo (oculto) | Fijo en 0% por decisión del negocio. No se muestra en formulario. |
| Subtotal | Calculado | = Total Bruto − Descuento |
| IVA | Calculado | Σ ivaItem de todos los ítems (con ajuste proporcional si hay descuento) |
| Total a Pagar | Calculado | = Subtotal + IVA |

### Notas y condiciones

| Campo | Tipo | Notas |
|-------|------|-------|
| Nota — Revisión / Informe técnico | Dinámico | Texto multilínea. Precargado con valor por defecto. Editable. |
| Nota — Retenciones | Dinámico | Texto multilínea. Precargado con valor por defecto. Editable. |
| Nota — Accesorios | Dinámico | Texto multilínea. Precargado con valor por defecto. Editable. |

---

## Comportamiento por bloque (T1.2)

### Encabezado
- Los datos de la empresa son fijos y están configurados en constantes.
- El número de cotización se sugiere automáticamente desde el correlativo guardado en localStorage.
- La fecha de emisión se inicializa con la fecha actual en formato ISO.
- La fecha de vencimiento se muestra informativamente; se recalcula al cambiar `validezDias`.

### Datos del cliente
- Nombre y NIT son obligatorios. El formulario no debe poder enviarse sin ellos.
- Ciudad, contacto, teléfono y vendedor son opcionales. Si están vacíos, no se renderizan en el PDF.
- Validación en tiempo real con mensajes claros junto a cada campo.

### Tabla de ítems
- Lista dinámica: el usuario puede agregar y eliminar filas.
- Cada fila tiene su propio campo de impuesto (%) para permitir ítems exentos o con tasas distintas.
- El bruto se calcula automáticamente por fila al cambiar cantidad o valor unitario.
- No hay límite artificial de ítems.

### Totales
- 100% calculados. Nunca editables directamente.
- Si no hay ítems, todos los totales deben mostrar 0.
- El descuento está fijo en 0% (oculto en formulario por decisión del negocio).

### Notas
- Bloque de texto con valores por defecto precargados.
- El usuario puede editar el texto para cada cotización puntual.
- Los valores por defecto están definidos en constantes.

### Vigencia
- Campo numérico simple (validez en días).
- La fecha de vencimiento se calcula informativamente y se muestra en la vista previa / PDF.

---

## Mejoras de UX detectadas (T1.3)

| # | Mejora | Estado |
|---|--------|--------|
| 1 | Estandarizar formato de moneda a `$ 000.000` sin decimales usando `Intl.NumberFormat('es-CO')` | **MVP** |
| 2 | Modelar campo de descuento opcional (0% por defecto) que da sentido a dos filas distintas (Subtotal vs Total Bruto) | **MVP** (oculto, fijo en 0%) |
| 3 | Agregar campos opcionales: ciudad, contacto, teléfono del cliente | **MVP** |
| 4 | Agregar campo opcional "Vendedor / Elaborado por" | **MVP** |
| 5 | El modelo de datos debe permitir impuestos distintos por ítem (no asumir IVA global 19%) | **MVP** |
| 6 | Validación en tiempo real con mensajes claros | **MVP** |
| 7 | Espacio reservado en layout para futura firma/sello de aceptación digital | **Backlog futuro** |

---

## Preguntas abiertas (T1.4) — Anexo C

Estas preguntas deben ser confirmadas con el dueño del negocio (no con el agente de programación):

1. **Numeración inicial:** ¿El próximo número de cotización debe continuar desde 118, o desde otro valor? → *Respuesta del negocio: desde 118.*
2. **Campos opcionales:** ¿Se desea agregar los campos opcionales sugeridos (ciudad, contacto, teléfono del cliente, vendedor) o mantener el formulario mínimo posible? → *Respuesta del negocio: sí, incluir los campos opcionales.*
3. **Descuento visible:** ¿El descuento opcional (0% por defecto) debe mostrarse en el formulario para esta primera versión, o se deja fijo en 0% internamente? → *Respuesta del negocio: no mostrar, dejarlo fijo en 0%.*
4. **Tamaño de papel PDF:** ¿Carta o A4? → *Respuesta del negocio: Carta.*
5. **Repositorio:** ¿Público o privado en GitHub? → *Respuesta del negocio: privado.*

---

## Flujo de usuario (T4.1)

1. El usuario abre la aplicación → ve el formulario vacío con valores por defecto (fecha de hoy, N.º C-1-118, impuesto 19%, notas precargadas).
2. Completa datos del cliente (nombre, NIT, opcionalmente ciudad/contacto/vendedor).
3. Agrega uno o más ítems (descripción, cantidad, valor unitario, impuesto); puede eliminar ítems agregados por error.
4. A medida que escribe, la vista previa a la derecha (o en la pestaña "Vista previa" en móvil) se actualiza automáticamente: filas de la tabla, subtotal, IVA, total.
5. Ajusta notas/vigencia si lo requiere (ya vienen precargadas).
6. Revisa la vista previa final.
7. Pulsa "Generar PDF".
8. La aplicación genera el archivo y dispara la descarga automáticamente.
9. El usuario recibe una confirmación visual y puede seguir editando o iniciar una nueva cotización.

Componentes implementados:
- `useQuoteForm` — hook central con React Hook Form + `useFieldArray` para ítems dinámicos
- `QuoteForm` — renderiza el formulario con secciones colapsadas
- `QuotePreview` — consume `control` via `useWatch` y se re-renderiza en cada cambio
- `ItemRow` — fila individual con cálculo de bruto en tiempo real
- `TotalsSummary` — muestra totales calculados

---

## QA visual — Checklist responsive (T3.7)

| Breakpoint | Estado | Notas |
|------------|--------|-------|
| 320px (móvil pequeño) | ✅ OK | Una columna, pestañas Editar/Vista previa funcionales. Sin scroll horizontal. |
| 375px (móvil estándar) | ✅ OK | Una columna. Formulario y vista previa se alternan con pestañas. "Generar PDF" visible en ambas vistas. |
| 768px (tablet) | ✅ OK | Una columna (breakpoint <1024px). Mismo comportamiento que móvil. |
| 1024px (escritorio) | ✅ OK | Dos columnas: formulario scrollable a la izquierda, vista previa sticky a la derecha. Sin scroll horizontal. |
| 1440px (escritorio HD) | ✅ OK | Dos columnas centradas (max-w-7xl). Proporciones equilibradas. |

### Comportamiento verificado
- **Escritorio (≥1024px):** formulario a la izquierda (scrolleable), cotización a la derecha (sticky). Ambas columnas visibles simultáneamente.
- **Móvil (<1024px):** pestañas "Editar" / "Vista previa" en la parte superior. El botón "Generar PDF" siempre accesible. Al alternar pestañas no se pierde el estado del formulario (los datos mock permanecen).
- La cuadrícula usa `grid-cols-1 lg:grid-cols-2` (mobile-first).

---

## Privacidad y almacenamiento local (T7.6)

La aplicación guarda datos exclusivamente en `localStorage` del navegador. No se envía información a ningún servidor.

| Clave | Contenido | Propósito |
|-------|-----------|-----------|
| `npc-numero` | Último correlativo usado (número entero) | Numeración automática de cotizaciones |
| `npc-borrador` | Estado completo del formulario (JSON) | Recuperación de borrador al recargar la página |

Ambos valores son locales al navegador y dispositivo. No hay backend, cuentas de usuario ni sincronización entre dispositivos.

---

## Checklist final de seguridad (T7.7)

| # | Ítem | Estado |
|---|------|--------|
| 1 | `dangerouslySetInnerHTML` no se usa en ningún componente | ✅ No hay ocurrencias en `src/` |
| 2 | Content Security Policy configurada vía meta tag | ✅ `index.html` — permisos mínimos necesarios |
| 3 | `npm audit` sin vulnerabilidades altas/críticas | ✅ 0 vulnerabilities |
| 4 | Licencias de dependencias compatibles con uso comercial | ✅ MIT, Apache-2.0, BSD (verificadas en `package.json`) |
| 5 | Dependabot configurado para actualizaciones automáticas | ✅ `.github/dependabot.yml` — semanal, lunes |
| 6 | Datos en `localStorage` documentados | ✅ Sección "Privacidad y almacenamiento local" |
| 7 | No hay API keys, tokens ni secretos en el código | ✅ App 100% estática, sin backend |
| 8 | La app no evalúa strings como código (`eval`, `new Function`) | ✅ No se usa en `src/` |

---

*Documento generado en Fase 1 del plan técnico. Última actualización: 2026-07-04.*
