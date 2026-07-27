# New Power Cotizador

Aplicación web para generar cotizaciones profesionales e informes técnicos con registro fotográfico en PDF, desarrollada para **NEW POWER ENERGY SAS**.

## Funcionalidades

### Módulo de Cotizaciones
- Cotizaciones profesionales con ítems dinámicos, impuestos por línea y descuentos.
- Vista previa en tiempo real (escritorio: dos columnas, móvil: pestañas).
- Auto-numeración correlativa (C-1-XXX).
- Borrador autoguardado en localStorage.

### Módulo de Informes Técnicos
- Informes técnicos con registro fotográfico por grupos de sitio/ubicación.
- Carga de fotos desde archivo, arrastrar y soltar, o cámara en móvil.
- Corrección automática de orientación y reducción de tamaño de imágenes.
- Cuadrícula uniforme de fotos con proporción fija en vista previa y PDF.
- Reordenar fotos y grupos (drag & drop en escritorio, botones en móvil).
- Auto-numeración de informe (IT-XXX).
- Borrador autoguardado en IndexedDB (soporta fotos en base64).

- **React 19** + **TypeScript**
- **Vite** (build)
- **Tailwind CSS v4** (estilos)
- **React Hook Form** + **Zod** (formularios y validación)
- **@react-pdf/renderer** (generación de PDF vectorial)
- **Vitest** + **Testing Library** (pruebas)

## Requisitos

- Node.js 20+
- npm

## Desarrollo local

```bash
npm install
npm run dev
# Abre http://localhost:5173
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción (salida en `dist/`) |
| `npm run preview` | Sirve `dist/` localmente |
| `npm run test` | Ejecuta pruebas unitarias |
| `npm run lint` | Ejecuta linter |
| `npm run format` | Formatea código con Prettier |
| `npm run deploy` | Compila para producción (alias de `build`) |

## Cómo actualizar la aplicación

La app está desplegada en **Cloudflare Pages** y se actualiza automáticamente con cada `git push` a la rama `main`:

```bash
git add .
git commit -m "descripción de los cambios"
git push origin main
```

Cloudflare Pages detecta el push, ejecuta `npm run build` y publica la carpeta `dist/`. El despliegue tarda aproximadamente 1-2 minutos.

### Revertir un despliegue

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **new-power-cotizador**
2. En la pestaña **Deployments**, busca el despliegue anterior que funcionaba
3. Haz clic en el menú de tres puntos (⋮) y selecciona **Rollback to this deployment**

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/          # Button, Input, Select, TextArea, Card
│   └── layout/      # Header, Footer, PageContainer
├── features/
│   ├── quote/       # Cotizaciones
│   │   ├── components/  # QuoteForm, QuotePreview, ItemRow, TotalsSummary
│   │   ├── hooks/       # useQuoteForm, useGeneratePdf
│   │   ├── logic/       # calculations, validation
│   │   ├── lib/         # formatCurrency, storage
│   │   └── pdf/         # QuotePDF, fonts
│   └── report/      # Informes técnicos
│       ├── components/  # ReportForm, ReportPreview, PhotoGroup
│       ├── hooks/       # useReportForm, useGenerateReportPdf
│       ├── logic/       # validation
│       ├── lib/         # format, storage, imageLoader
│       ├── pdf/         # ReportPDF
│       └── types.ts
├── constants/
├── assets/          # logo, fonts
├── App.tsx
└── main.tsx
```

## Documentación adicional

- [Especificación de campos — Cotizaciones](./docs/spec-campos.md)
- [Especificación de datos — Informes Técnicos](./docs/spec-informes.md)
- [Arquitectura del módulo de informes técnicos](./docs/REPORT-ARCHITECTURE.md)
- [Decisiones de arquitectura](./docs/ADR.md)
- [Plan técnico completo](./docs/ARCHITECTURE.md)

## Licencia

Uso comercial — NEW POWER ENERGY SAS
