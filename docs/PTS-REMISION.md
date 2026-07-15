# Project Technical Specification (PTS)
## Módulo: Remisión — New Power Energy S.A.S.

**Versión:** 1.0
**Fecha:** 2026-07-15
**Estado:** Borrador para aprobación
**Clasificación:** Confidencial – Uso interno del proyecto

---

## Tabla de Contenidos

1. Resumen Ejecutivo
2. Objetivos
3. Problema que Resuelve
4. Análisis del Proyecto Existente
5. Arquitectura del Sistema
6. Sistema de Diseño
7. Especificación del Módulo
8. Modelo de Datos
9. Requerimientos Funcionales
10. Requerimientos No Funcionales
11. Restricciones
12. Dependencias
13. Supuestos y Decisiones de Diseño
14. Riesgos Técnicos
15. Estrategia de Implementación
16. Criterios de Aceptación
17. Plan de Pruebas

---

## 1. Resumen Ejecutivo

Este documento constituye la **Project Technical Specification (PTS)** para el módulo **Remisión** de la plataforma **New Power Cotizador**. El módulo permitirá generar documentos de remisión (despacho/entrega) asociados a cotizaciones y contratos de compraventa, con datos dinámicos de cliente, información logística, detalle de entrega configurable y generación de PDF profesional.

El sistema se integra como una nueva feature dentro de la aplicación existente `new-power-cotizador`, siguiendo la misma arquitectura, sistema de diseño y patrones de desarrollo utilizados por los módulos de Cotización, Informe Técnico y Contrato de Compraventa.

---

## 2. Objetivos

### 2.1 Objetivo General
Desarrollar un módulo de generación de remisiones que permita al usuario completar un formulario estructurado y generar un PDF profesional, integrado completamente con la aplicación existente.

### 2.2 Objetivos Específicos

| ID | Objetivo | Criterio de Éxito |
|----|----------|-------------------|
| O01 | Proveer un formulario estructurado con datos de cliente, logística, detalle de entrega y firmas | 100% de los campos del diseño implementados y funcionales |
| O02 | Generar PDF profesional con el formato exacto del diseño | El PDF generado coincide visualmente con el diseño especificado |
| O03 | Integrar el módulo en la aplicación existente sin afectar otras funcionalidades | Todos los módulos existentes siguen funcionando sin cambios |
| O04 | Reutilizar componentes UI existentes manteniendo consistencia visual | Mismos componentes, paleta, tipografía y espaciados |
| O05 | Soportar auto-guardado de borrador y recuperación | Al recargar, el formulario recupera el estado anterior |
| O06 | Todos los campos deben ser dinámicos y editables | El usuario puede editar, agregar y eliminar elementos sin restricciones |

---

## 3. Problema que Resuelve

Actualmente, las remisiones se generan manualmente (documentos Word), lo que implica:
- Proceso manual propenso a errores de tipeo
- Dificultad para mantener consistencia en el formato
- Sin integración con cotizaciones y contratos existentes
- Sin capacidad de auto-guardado ni recuperación de borradores

---

## 4. Análisis del Proyecto Existente

### 4.1 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework UI | React | 19.2.7 |
| Lenguaje | TypeScript | ~6.0.2 |
| Build | Vite | 8.1.1 |
| Estilos | Tailwind CSS | 4.3.2 |
| Formularios | React Hook Form | 7.80.0 |
| Validación | Zod | 4.4.3 |
| PDF | @react-pdf/renderer | 4.5.1 |
| Testing | Vitest | 4.1.9 |
| Linting | Oxlint | 1.71.0 |
| Iconos | Lucide React | 1.23.0 |
| Despliegue | Cloudflare Workers | — |

### 4.2 Estructura del Módulo Propuesta

```
src/features/remision/
├── components/
│   ├── RemisionForm.tsx       # Formulario principal
│   └── RemisionPreview.tsx     # Vista previa en vivo
├── hooks/
│   ├── useRemisionForm.ts     # Hook de formulario + borrador
│   └── useGenerateRemisionPdf.tsx  # Hook de generación PDF
├── lib/
│   ├── format.ts              # Formateo de fechas
│   └── storage.ts             # localStorage helpers
├── logic/
│   └── validation.ts          # Esquemas Zod
├── pdf/
│   └── RemisionPDF.tsx        # Componente PDF
└── types.ts                   # Interfaces del módulo
```

### 4.3 Sistema de Diseño (Reutilizado)

| Token | Valor | Uso |
|-------|-------|-----|
| `brand-orange` | `#f97316` | Acento principal, botones primarios |
| `brand-orange-dark` | `#ea580c` | Hover estados, totales fuertes |
| `brand-orange-light` | `#fed7aa` | Bordes, fondos suaves, headers de tabla |
| `brand-dark` | `#1c1917` | Texto principal, títulos |
| `brand-gray` | `#44403c` | Texto secundario, metadatos |
| `brand-light` | `#f5f5f4` | Fondos alternos secciones |
| Font | Inter (Regular 400, SemiBold 600, Bold 700) | Toda la aplicación |
| Border radius | `lg` (8px), `xl` (12px) | Cards, botones, inputs |

---

## 5. Especificación del Módulo

### 5.1 Diseño de Interfaz

El diseño se basa en el mockup especificado. La UI consta de:

**Pantalla Home:** Nuevo botón "Remisión" con icono `Truck` (Lucide).

**Formulario (columna izquierda):**
- **Encabezado**: N.º Remisión, Fecha, N.º Pedido, N.º Contrato
- **Cliente**: Nombre, CC/NIT, Dirección, Ciudad, Teléfono
- **Información Logística**: Lugar despacho, Lugar entrega, Responsable transporte, Vehículo, Placa
- **Detalle de Entrega**: Lista dinámica con campos: Cantidad, Código, Descripción, Serial, Observaciones. Selección múltiple con checkboxes, eliminar individual/seleccionados/todos, agregar ilimitado.
- **Observaciones**: TextArea multilínea
- **Firmas**: Dos columnas (Entrega / Recibe), cada una con: Nombre, Cargo, Documento, Fecha, Hora

**Vista Previa (columna derecha):**
- Header con logo y datos de NEW POWER ENERGY S.A.S. + título "REMISIÓN"
- Secciones: Cliente, Información Logística, Detalle de Entrega (tabla)
- Observaciones
- Firmas

### 5.2 Campos del Formulario

#### Encabezado
| Campo | Tipo | Notas |
|-------|------|-------|
| N.º Remisión | Texto (auto) | Formato `R-001` |
| Fecha | Date | Default hoy |
| N.º Pedido | Texto | Opcional |
| N.º Contrato | Texto | Opcional |

#### Cliente
| Campo | Tipo | Notas |
|-------|------|-------|
| Nombre | Texto (obligatorio) | — |
| CC/NIT | Texto (obligatorio) | — |
| Dirección | Texto (opcional) | — |
| Ciudad | Texto (opcional) | — |
| Teléfono | Texto (opcional) | — |

#### Información Logística
| Campo | Tipo | Default |
|-------|------|---------|
| Lugar despacho | Texto | Villavicencio |
| Lugar entrega | Texto | Medellín |
| Responsable transporte | Texto | — |
| Vehículo | Texto | — |
| Placa | Texto | — |

#### Detalle de Entrega (dinámico)
| Campo | Tipo | Default ejemplo |
|-------|------|----------------|
| Cantidad | Texto | 1 |
| Código | Texto | PL-450 |
| Descripción | Texto | Planta eléctrica 450 KVA |
| Serial | Texto | — |
| Observaciones | Texto | Motor Detroit |

#### Firmas
| Campo | Tipo |
|-------|------|
| Nombre | Texto |
| Cargo | Texto |
| Documento | Texto |
| Fecha | Date |
| Hora | Time |

---

## 6. Modelo de Datos

```typescript
interface Cliente {
  nombre: string
  ccNit: string
  direccion: string
  ciudad: string
  telefono: string
}

interface InformacionLogistica {
  lugarDespacho: string
  lugarEntrega: string
  responsableTransporte: string
  vehiculo: string
  placa: string
}

interface DetalleItem {
  id: string
  cantidad: string
  codigo: string
  descripcion: string
  serial: string
  observaciones: string
}

interface FirmaInfo {
  nombre: string
  cargo: string
  documento: string
  fecha: string
  hora: string
}

interface Remision {
  numero: string
  fecha: string
  pedido: string
  contrato: string
  cliente: Cliente
  logistica: InformacionLogistica
  detalles: DetalleItem[]
  observaciones: string
  entrega: FirmaInfo
  recibe: FirmaInfo
}
```

---

## 7. Requerimientos Funcionales

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF01 | El módulo debe ser accesible desde la pantalla de inicio como una opción más | Alta |
| RF02 | Los datos del encabezado (N.º remisión, fecha) deben auto-generarse | Alta |
| RF03 | Los datos del cliente deben ser editables y validables | Alta |
| RF04 | La información logística debe tener valores por defecto | Alta |
| RF05 | El detalle de entrega debe ser completamente dinámico (agregar, editar, eliminar) | Alta |
| RF06 | La selección múltiple en detalle debe permitir eliminar uno, varios o todos | Alta |
| RF07 | La vista previa debe actualizarse en tiempo real | Alta |
| RF08 | El PDF debe contener todas las secciones: header, cliente, logística, detalle, firmas | Alta |
| RF09 | El PDF debe incluir logo, numeración de páginas y datos de empresa | Alta |
| RF10 | El formulario debe auto-guardar borrador al escribir | Media |
| RF11 | Al recargar, debe recuperar el borrador automáticamente | Media |
| RF12 | El PDF debe descargarse con nombre de archivo dinámico | Media |

---

## 8. Requerimientos No Funcionales

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF01 | Consistencia visual con el sistema de diseño existente | Misma paleta, tipografía, espaciados |
| RNF02 | Tiempo de generación de PDF < 3 segundos | Medible con console.time |
| RNF03 | Compatibilidad responsive (escritorio 2 columnas, móvil 1 columna) | Mismo patrón que contrato |
| RNF04 | Sin fugas de memoria (cleanup de timers, subscriptions) | useEffect return cleanup |
| RNF05 | Código limpio sin warnings de compilación | tsc -b sin errores |
| RNF06 | Tipado fuerte sin `any` | TypeScript strict |

---

## 9. Restricciones

| ID | Restricción | Tipo |
|----|-------------|------|
| R01 | El proyecto usa React 19 + TypeScript ~6.0 | Técnica |
| R02 | Los estilos deben usar Tailwind CSS 4 con @theme | Técnica |
| R03 | Los PDFs deben generarse con @react-pdf/renderer 4.x | Técnica |
| R04 | Los formularios deben usar React Hook Form | Técnica |
| R05 | Las validaciones deben usar Zod | Técnica |
| R06 | No se deben agregar nuevas dependencias | Técnica |

---

## 10. Dependencias

| Dependencia | Tipo | Módulo Afectado |
|-------------|------|-----------------|
| @react-pdf/renderer | Externa | RemisionPDF.tsx |
| react-hook-form | Externa | RemisionForm.tsx |
| zod | Externa | validation.ts |
| lucide-react | Externa | App.tsx (icono Truck) |
| Componentes UI existentes | Interna | RemisionForm.tsx |

---

## 11. Supuestos y Decisiones de Diseño

| ID | Supuesto/Decisión | Justificación | Impacto |
|----|-------------------|---------------|---------|
| S01 | Los datos logísticos tienen valores por defecto (Villavicencio/Medellín) | Basado en el flujo de negocio típico | Simplifica el formulario |
| S02 | El detalle de entrega se basa en una estructura dinámica con id único | Mismo patrón que especificaciones/contrato | Permite flexibilidad total |
| S03 | Las firmas no requieren campo "firma" en el formulario (solo en PDF) | La firma digital se manejará en una fase posterior | Se omite input de firma en formulario |
| S04 | Los checkboxes de selección masiva son por índice en el array | Mismo patrón que cláusulas en contrato | Consistencia entre módulos |

---

## 12. Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Inconsistencia en estilos del PDF | Baja | Medio | Revisar ContractPDF.tsx como referencia |
| Problemas de layout en PDF con @react-pdf | Media | Medio | Usar Flexbox, probar con datos reales |
| Conflictos de merge con código existente | Baja | Medio | Trabajar feature aislada |

---

## 13. Estrategia de Implementación

1. Crear tipos e interfaces (`types.ts`)
2. Crear esquemas de validación (`validation.ts`)
3. Crear helpers de almacenamiento (`storage.ts`)
4. Crear hook de formulario (`useRemisionForm.ts`)
5. Crear hook de generación PDF (`useGenerateRemisionPdf.tsx`)
6. Crear componente de formulario (`RemisionForm.tsx`)
7. Crear componente de vista previa (`RemisionPreview.tsx`)
8. Crear componente PDF (`RemisionPDF.tsx`)
9. Integrar en App.tsx (nuevo botón + ruta)
10. Probar compilación y generación de PDF
11. Commit, push y deploy

---

## 14. Criterios de Aceptación

- [ ] El formulario muestra todos los campos especificados en el diseño
- [ ] La vista previa se actualiza en tiempo real
- [ ] El PDF generado contiene header con logo y datos de la empresa
- [ ] El PDF contiene datos de cliente, logística, detalle y firmas
- [ ] El detalle de entrega permite agregar/editar/eliminar items
- [ ] La selección múltiple funciona (individual, varios, todos)
- [ ] El proyecto compila sin errores (`npm run build`)
- [ ] No hay warnings de lint (`npm run lint`)
- [ ] Los tests existentes siguen pasando (`npm run test`)
- [ ] El módulo es responsive (2 columnas escritorio, 1 columna móvil)

---

## 15. Plan de Pruebas

| Prueba | Descripción | Tipo |
|--------|-------------|------|
| P01 | Renderizado del formulario con valores por defecto | Visual |
| P02 | Edición de campos del cliente | Funcional |
| P03 | Agregar/eliminar items de detalle | Funcional |
| P04 | Selección múltiple y eliminación masiva | Funcional |
| P05 | Vista previa refleja cambios en tiempo real | Integración |
| P06 | Generación de PDF con datos completos | Funcional |
| P07 | Auto-guardado y recuperación de borrador | Funcional |
| P08 | Responsive: 2 columnas en escritorio, 1 en móvil | Visual |
| P09 | Compilación sin errores | Build |
