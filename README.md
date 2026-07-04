# New Power Cotizador

Aplicación web para generar cotizaciones profesionales en PDF, desarrollada para **NEW POWER ENERGY SAS**.

## Tecnologías

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
│   └── quote/
│       ├── components/  # QuoteForm, QuotePreview, ItemRow, TotalsSummary
│       ├── hooks/       # useQuoteForm, useGeneratePdf
│       ├── logic/       # calculations, validation
│       ├── lib/         # formatCurrency, storage
│       └── pdf/         # QuotePDF, fonts
├── constants/
├── assets/          # logo, fonts
├── App.tsx
└── main.tsx
```

## Documentación adicional

- [Especificación de campos](./docs/spec-campos.md)
- [Decisiones de arquitectura](./docs/ADR.md)
- [Plan técnico completo](./docs/ARCHITECTURE.md)

## Licencia

Uso comercial — NEW POWER ENERGY SAS
