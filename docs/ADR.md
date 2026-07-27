# Architecture Decision Records (ADR)

## ADR-001: Framework UI

- **Decisión:** React + TypeScript
- **Alternativas consideradas:** Vue 3, Svelte, Angular
- **Motivo:** Ecosistema más amplio y mejor soportado por herramientas de IA/agentes de código; tipado estático reduce errores en cálculos financieros.

## ADR-002: Herramienta de build

- **Decisión:** Vite
- **Alternativas consideradas:** Create React App (deprecado), Webpack, Parcel
- **Motivo:** Arranque y build mucho más rápidos; genera dist/ puramente estático ideal para hosting gratuito sin servidor.

## ADR-003: Estilos

- **Decisión:** Tailwind CSS
- **Alternativas consideradas:** CSS Modules, Styled Components, Material UI
- **Motivo:** Permite diseño responsive mobile-first ágil sin escribir CSS a mano; consistente con la necesidad de "muy fácil de usar y moderno" sin sobrecargar el bundle.

## ADR-004: Formularios

- **Decisión:** React Hook Form
- **Alternativas consideradas:** Formik, Final Form, uncontrolled componentes
- **Motivo:** Alto rendimiento (evita re-renders innecesarios), soporta `useFieldArray` ideal para la lista dinámica de ítems.

## ADR-005: Validación

- **Decisión:** Zod + @hookform/resolvers
- **Alternativas consideradas:** Yup, Joi, validación manual
- **Motivo:** Esquema de validación tipado, reutilizable también para el motor de cálculo.

## ADR-006: Generación de PDF

- **Decisión:** @react-pdf/renderer
- **Alternativas consideradas:** html2canvas + jsPDF, Print.js, APIs de pago
- **Motivo:** Genera PDF vectorial (texto nítido, no imagen); describe el documento como componentes React, coherente con el resto del stack.

## ADR-007: Formato de moneda/fecha

- **Decisión:** Intl nativo (Intl.NumberFormat, Intl.DateTimeFormat)
- **Alternativas consideradas:** moment.js, dayjs, numeral.js
- **Motivo:** Cero dependencias adicionales; nativo, mantenido por el propio motor JS.

## ADR-008: Persistencia local

- **Decisión:** localStorage
- **Alternativas consideradas:** IndexedDB, Firebase, backend propio
- **Motivo:** No se requiere backend; localStorage es suficiente para un solo usuario en un solo dispositivo.

## ADR-009: Testing

- **Decisión:** Vitest + Testing Library
- **Alternativas consideradas:** Jest, Mocha, Cypress
- **Motivo:** Integración nativa con Vite; usado para probar el motor de cálculo (crítico, maneja dinero).

## ADR-010: Hosting

- **Decisión:** Cloudflare Pages (plan gratuito)
- **Alternativas consideradas:** GitHub Pages, Netlify, Vercel
- **Motivo:** Ancho de banda ilimitado en plan gratuito; uso comercial permitido explícitamente; integración nativa con GitHub; no requiere tarjeta de crédito.
