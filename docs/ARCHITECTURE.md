# Plan Técnico — Cotizador Web

> Documento de arquitectura completo del proyecto. Usar como referencia en todas las fases.

## Contenido

1. [Fase 1 — Análisis de campos y especificación](#fase-1--análisis-de-campos-y-especificación)
2. [Fase 2 — Arquitectura del proyecto y stack tecnológico](#fase-2--arquitectura-del-proyecto-y-stack-tecnológico)
3. [Fase 3 — Diseño de la interfaz (UI/UX)](#fase-3--diseño-de-la-interfaz-uiux)
4. [Fase 4 — Flujo funcional de la aplicación](#fase-4--flujo-funcional-de-la-aplicación)
5. [Fase 5 — Lógica de negocio y manejo de datos](#fase-5--lógica-de-negocio-y-manejo-de-datos)
6. [Fase 6 — Generación y diseño del PDF](#fase-6--generación-y-diseño-del-pdf)
7. [Fase 7 — Seguridad y buenas prácticas](#fase-7--seguridad-y-buenas-prácticas)
8. [Fase 8 — Despliegue gratuito y mantenimiento](#fase-8--despliegue-gratuito-y-mantenimiento)
9. [Anexo A — Checklist Definition of Done](#anexo-a--checklist-global-de-definition-of-done)
10. [Anexo B — Preguntas abiertas](#anexo-b--preguntas-abiertas-para-confirmar-con-el-cliente)

---

## Fase 1 — Análisis de campos y especificación

### Modelo de datos extraído del PDF original

#### Encabezado — Datos de la empresa (fijos)
- Nombre: NEW POWER ENERGY SAS
- NIT: 901826285-6
- Dirección: VILLAVICENCIO-META
- Teléfono: (57) 3204931541

#### Encabezado — Datos de la cotización
- Número de cotización: formato `C-1-{correlativo}`
- Fecha de emisión: ISO date, default hoy
- Validez (días): default 15
- Fecha de vencimiento: calculada = fechaEmisión + validezDías

#### Datos del cliente
- Nombre: obligatorio
- NIT: obligatorio
- Ciudad: opcional
- Contacto: opcional
- Teléfono: opcional
- Vendedor: opcional

#### Ítems (tabla dinámica)
- N.º ítem: auto
- Descripción: texto
- Cantidad: número > 0
- Valor unitario: número >= 0 (COP)
- Impuesto %: 0–100, default 19
- Vr. Bruto: calculado = cantidad × valorUnitario

#### Totales
- Total Bruto: Σ bruto
- Descuento %: 0% por defecto (oculto)
- Subtotal: Total Bruto − Descuento
- IVA: Σ ivaItem (con ajuste proporcional si hay descuento)
- Total a Pagar: Subtotal + IVA

#### Notas y condiciones
- Bloque de texto multilínea con valores por defecto precargados.
- Editable por cotización.

---

## Fase 2 — Arquitectura del proyecto y stack tecnológico

### Decisiones de arquitectura

| Decisión | Elección | Por qué |
|----------|----------|---------|
| Framework UI | React 18 + TypeScript | Ecosistema amplio, tipado estático reduce errores en cálculos financieros |
| Herramienta de build | Vite | Arranque/build rápido, genera dist/ estático |
| Estilos | Tailwind CSS | Diseño responsive mobile-first ágil sin CSS manual |
| Formularios | React Hook Form | Alto rendimiento, soporta useFieldArray para lista dinámica |
| Validación | Zod + @hookform/resolvers | Esquema tipado reutilizable para motor de cálculo |
| Generación de PDF | @react-pdf/renderer | PDF vectorial, text nítido, componentes React |
| Formato moneda/fecha | Intl nativo (Intl.NumberFormat, Intl.DateTimeFormat) | Cero dependencias adicionales |
| Persistencia local | localStorage | Suficiente para un solo usuario/dispositivo |
| Testing | Vitest + Testing Library | Integración nativa con Vite |
| Linting/formato | ESLint + Prettier | Estándar industria, consistencia |

### Librerías a evitar
- moment.js (deprecado)
- jQuery (innecesario con React)
- html2canvas + jsPDF como método principal de PDF (rasteriza, pierde calidad)
- Librerías UI pesadas (Material UI, etc.)
- Servicios de generación de PDF en la nube de pago

### Estructura de carpetas objetivo

```
new-power-cotizador/
├── public/
│   └── logo-new-power.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/             # Button, Input, Select, Card, TextArea
│   │   └── layout/         # Header, Footer, PageContainer
│   ├── features/
│   │   └── quote/
│   │       ├── components/  # QuoteForm, QuotePreview, ItemRow, TotalsSummary
│   │       ├── pdf/         # QuotePDF.tsx
│   │       ├── hooks/       # useQuoteForm.ts, useQuoteNumber.ts
│   │       ├── logic/       # calculations.ts, validation.ts
│   │       ├── lib/         # formatCurrency.ts, formatDate.ts, storage.ts
│   │       └── types.ts
│   ├── constants/           # empresa.ts, defaults.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   ├── spec-campos.md
│   └── ADR.md
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Fase 3 — Diseño de la interfaz (UI/UX)

### Lineamientos

- **Paleta**: naranja/ámbar como acento, gris oscuro para texto, blanco como fondo
- **Tipografía**: sans-serif profesional (Inter), 2–3 pesos
- **Layout escritorio (≥1024px)**: dos columnas — formulario izquierda (scrolleable), vista previa derecha (sticky)
- **Layout móvil (<768px)**: una columna, alternancia por pestañas "Editar" / "Vista previa"
- **Formulario**: secciones colapsables: Datos cotización, Datos cliente, Ítems, Notas
- **Vista previa**: refleja exactamente el layout del PDF

---

## Fase 4 — Flujo funcional de la aplicación

### Flujo de usuario (9 pasos)

1. Abre app → formulario con valores por defecto
2. Completa datos del cliente
3. Agrega/elimina ítems
4. Vista previa se actualiza en tiempo real
5. Ajusta notas/vigencia
6. Revisa vista previa
7. Pulsa "Generar PDF"
8. Descarga automática del archivo
9. Confirmación visual

---

## Fase 5 — Lógica de negocio y manejo de datos

### Modelo de datos (TypeScript)

```typescript
export interface Cliente {
  nombre: string;
  nit: string;
  ciudad?: string;
  contacto?: string;
  telefono?: string;
}

export interface ItemCotizacion {
  id: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  impuestoPorcentaje: number;
}

export interface Cotizacion {
  numero: string;
  fecha: string;
  validezDias: number;
  cliente: Cliente;
  items: ItemCotizacion[];
  descuentoPorcentaje: number;
  notas: {
    revisionInforme: string;
    retenciones: string;
    accesorios: string;
  };
  vendedor?: string;
}
```

### Motor de cálculo

- Por ítem: `bruto = cantidad × valorUnitario`, `ivaItem = bruto × (impuestoPorcentaje / 100)`
- Totales: `totalBruto = Σ bruto`, `descuento = totalBruto × (descuentoPorcentaje / 100)`, `subtotal = totalBruto − descuento`, `totalIva = Σ ivaItem` (ajuste proporcional si hay descuento), `totalAPagar = subtotal + totalIva`

---

## Fase 6 — Generación y diseño del PDF

- Componente QuotePDF con @react-pdf/renderer
- Tamaño: Carta (decisión del negocio)
- Logo embebido como asset
- Numeración de páginas: "Página X de Y"
- Nombre de archivo dinámico: `Cotizacion-{numero}-{cliente}.pdf`

---

## Fase 7 — Seguridad y buenas prácticas

- Sin dangerouslySetInnerHTML sin sanitizar
- Content Security Policy básica
- npm audit sin vulnerabilidades altas/críticas
- Dependabot para actualizaciones automáticas
- Documentación de datos guardados en localStorage

---

## Fase 8 — Despliegue gratuito y mantenimiento

- **Opción recomendada**: Cloudflare Pages
  - Ancho de banda ilimitado en plan gratuito
  - Uso comercial permitido explícitamente
  - Integración nativa con GitHub
  - No requiere tarjeta de crédito
- **Alternativa**: GitHub Pages
- Build: `npm run build`, carpeta de salida: `dist/`

---

## Anexo A — Checklist global de Definition of Done

- [ ] docs/spec-campos.md completo y actualizado (Fase 1)
- [ ] Proyecto compila sin errores ni warnings de lint (Fase 2)
- [ ] UI responsive verificada en 5 breakpoints (Fase 3)
- [ ] Flujo completo (formulario → vista previa → PDF) probado (Fase 4)
- [ ] Motor de cálculo con ≥5 pruebas unitarias en verde (Fase 5)
- [ ] PDF generado visualmente equivalente o superior al original (Fase 6)
- [ ] npm audit sin vulnerabilidades altas/críticas sin resolver (Fase 7)
- [ ] Aplicación accesible públicamente (Fase 8)
- [ ] README.md completo (Fase 8)

---

## Anexo B — Preguntas abiertas para confirmar con el cliente

1. ¿El próximo número de cotización debe continuar desde 118?
2. ¿Agregar campos opcionales (ciudad, contacto, teléfono, vendedor)?
3. ¿Descuento visible en formulario o fijo en 0%?
4. ¿Tamaño de papel: Carta o A4?
5. ¿Repositorio público o privado?
