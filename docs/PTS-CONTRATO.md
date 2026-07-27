# Project Technical Specification (PTS)
## Módulo: Contrato de Compraventa — New Power Energy S.A.S.

**Versión:** 1.0
**Fecha:** 2026-07-15
**Estado:** Aprobado para implementación
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

Este documento constituye la **Project Technical Specification (PTS)** para el módulo **Contrato de Compraventa** de la plataforma **New Power Cotizador**. El módulo permitirá generar contratos de compraventa de plantas eléctricas usadas, con datos dinámicos de vendedor, comprador, especificaciones del equipo, resumen económico y cláusulas legales predefinidas, con generación de PDF profesional.

El sistema se integra como una nueva feature dentro de la aplicación existente `new-power-cotizador`, siguiendo la misma arquitectura, sistema de diseño y patrones de desarrollo utilizados por los módulos de Cotización e Informe Técnico.

---

## 2. Objetivos

### 2.1 Objetivo General
Desarrollar un módulo de generación de contratos de compraventa que permita al usuario completar un formulario estructurado y generar un PDF profesional, integrado completamente con la aplicación existente.

### 2.2 Objetivos Específicos

| ID | Objetivo | Criterio de Éxito |
|----|----------|-------------------|
| O01 | Proveer un formulario estructurado con datos de vendedor, comprador, equipo y económicos | 100% de los campos del diseño implementados y funcionales |
| O02 | Generar PDF profesional con el formato exacto del diseño | El PDF generado coincide visualmente con el diseño especificado |
| O03 | Integrar el módulo en la aplicación existente sin afectar otras funcionalidades | Todos los módulos existentes siguen funcionando sin cambios |
| O04 | Reutilizar componentes UI existentes manteniendo consistencia visual | Mismos componentes, paleta, tipografía y espaciados |
| O05 | Soportar auto-guardado de borrador y recuperación | Al recargar, el formulario recupera el estado anterior |

---

## 3. Problema que Resuelve

Actualmente, los contratos de compraventa se generan manualmente (documentos Word/PDF), lo que implica:
- Proceso manual propenso a errores de tipeo
- Dificultad para mantener consistencia en el formato
- Sin integración con el resto de las herramientas (cotizaciones, informes)
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
| Formato | Prettier | 3.9.4 |
| Iconos | Lucide React | 1.23.0 |
| Despliegue | Cloudflare Workers | — |

### 4.2 Estructura de Directorios

```
src/
├── components/
│   ├── layout/       # Header, Footer, PageContainer
│   └── ui/           # Button, Card, Input, Select, TextArea, NumberInput
├── features/
│   ├── contabilidad/ # Módulo de comprobantes contables
│   ├── quote/        # Módulo de cotizaciones (PDF)
│   └── report/       # Módulo de informes técnicos (PDF)
├── assets/           # Logo, imágenes, fuentes
├── App.tsx           # Router principal con estados
├── main.tsx          # Entry point
└── index.css         # Config Tailwind, tema global
```

### 4.3 Sistema de Diseño Identificado

| Token | Valor | Uso |
|-------|-------|-----|
| `brand-orange` | `#f97316` | Acento principal, botones primarios |
| `brand-orange-dark` | `#ea580c` | Hover estados, totales fuertes |
| `brand-orange-light` | `#fed7aa` | Bordes, fondos suaves, headers de tabla |
| `brand-dark` | `#1c1917` | Texto principal, títulos |
| `brand-gray` | `#44403c` | Texto secundario, metadatos |
| `brand-light` | `#f5f5f4` | Fondos alternos secciones |
| Font | Inter (Regular 400, SemiBold 600, Bold 700) | Toda la aplicación |
| Border radius | `lg` (8px), `xl` (12px), `full` (50%) | Cards, botones, inputs |
| Sombra | `shadow-sm` | Cards |

---

## 5. Arquitectura del Sistema

### 5.1 Estructura del Módulo

El módulo `contract` se ubicará dentro de `src/features/` siguiendo el patrón de `quote` y `report`:

```
src/features/contract/
├── components/
│   ├── ContractForm.tsx      # Formulario principal
│   └── ContractPreview.tsx    # Vista previa en vivo
├── hooks/
│   └── useContractForm.ts    # Hook de formulario + borrador
├── logic/
│   ├── validation.ts         # Esquemas Zod
│   └── calculations.ts       # Cálculos económicos
├── pdf/
│   └── ContractPDF.tsx       # Componente PDF (@react-pdf)
├── lib/
│   ├── format.ts             # Formateo de moneda
│   └── storage.ts            # localStorage helpers
└── types.ts                  # Interfaces del módulo
```

### 5.2 Integración con App.tsx

Se agregará un nuevo caso `'contract'` al tipo `Modulo` y un nuevo botón en la pantalla de inicio con icono `FileSignature` (Lucide).

---

## 6. Especificación del Módulo

### 6.1 Diseño de Interfaz

El diseño se basa en el documento `Contrato de Compraventa` especificado. La UI consta de:

**Pantalla Home:** Nuevo botón "Contrato de compraventa" con icono `FileSignature`.

**Formulario (columna izquierda):**
- Datos del Vendedor (Razón social, NIT, Dirección, Ciudad, Teléfono, Correo)
- Datos del Comprador (Nombre, CC/NIT, Dirección, Ciudad, Teléfono, Correo)
- Especificaciones del Equipo (Marca, Potencia, Modelo, Serial Motor, Serial Generador, Horas, Voltaje, Frecuencia, Radiador, Breaker, Módulo, Baterías)
- Resumen Económico (Valor total, Pago inicial, Saldo, Fecha límite)

**Vista Previa (columna derecha):**
- Header con logo y datos de NEW POWER ENERGY S.A.S.
- Título "CONTRATO DE COMPRAVENTA — Planta Eléctrica Usada 500 KVA"
- Secciones de Vendedor, Comprador, Especificaciones, Resumen Económico
- 12 cláusulas predefinidas
- Observaciones (editables)
- Firmas

### 6.2 Campos del Formulario

#### Vendedor (precargado con valores fijos de la empresa)
| Campo | Tipo | Default |
|-------|------|---------|
| Razón social | Texto | "NEW POWER ENERGY S.A.S." |
| NIT | Texto | "901.826.285-6" |
| Dirección | Texto | "Villavicencio, Meta" |
| Ciudad | Texto | "Villavicencio" |
| Teléfono | Texto | "(57) 3204931541" |
| Correo | Texto | — |

#### Comprador
| Campo | Tipo | Notas |
|-------|------|-------|
| Nombre | Texto (obligatorio) | — |
| CC/NIT | Texto (obligatorio) | — |
| Dirección | Texto (opcional) | — |
| Ciudad | Texto (opcional) | — |
| Teléfono | Texto (opcional) | — |
| Correo | Texto (opcional) | — |

#### Especificaciones del Equipo
| Campo | Tipo | Default/Notas |
|-------|------|---------------|
| Marca | Select/Texto | "Detroit" (default) |
| Potencia | Select/Texto | "500 KVA" (default) |
| Modelo | Texto | — |
| Serial Motor | Texto | — |
| Serial Generador | Texto | — |
| Horas | Número | — |
| Voltaje | Texto | — |
| Frecuencia | Texto | — |
| Radiador | Checkbox | Sí (default) |
| Breaker | Checkbox | Sí (default) |
| Módulo | Checkbox | Sí (default) |
| Baterías | Número | 2 (default) |

#### Resumen Económico
| Campo | Tipo | Default |
|-------|------|---------|
| Valor total | Número (COP) | 65,000,000 |
| Pago inicial | Número (COP) | 45,000,000 |
| Saldo | Calculado | = Valor total − Pago inicial |
| Fecha límite | Date | — |

#### Cláusulas (12, predefinidas, no editables en formulario pero visibles en PDF)
1. Objeto
2. Forma de pago
3. Entrega
4. Obligaciones del vendedor
5. Obligaciones del comprador
6. Garantía
7. Transporte
8. Instalación
9. Estado del equipo
10. Incumplimiento
11. Cláusula penal
12. Perfeccionamiento

#### Observaciones
| Campo | Tipo |
|-------|------|
| Observaciones | TextArea multilínea |

---

## 7. Modelo de Datos

```typescript
export interface Vendedor {
  razonSocial: string
  nit: string
  direccion: string
  ciudad: string
  telefono: string
  correo: string
}

export interface Comprador {
  nombre: string
  ccNit: string
  direccion: string
  ciudad: string
  telefono: string
  correo: string
}

export interface EspecificacionesEquipo {
  marca: string
  potencia: string
  modelo: string
  serialMotor: string
  serialGenerador: string
  horas: number
  voltaje: string
  frecuencia: string
  radiador: boolean
  breaker: boolean
  modulo: boolean
  baterias: number
}

export interface ResumenEconomico {
  valorTotal: number
  pagoInicial: number
  saldo: number     // calculado
  fechaLimite: string
}

export interface ContratoCompraventa {
  numero: string
  fecha: string
  vendedor: Vendedor
  comprador: Comprador
  equipo: EspecificacionesEquipo
  economico: ResumenEconomico
  observaciones: string
}
```

---

## 8. Requerimientos Funcionales

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF01 | El módulo debe ser accesible desde la pantalla de inicio como una opción más | Alta |
| RF02 | El formulario debe mostrar datos del vendedor precargados por defecto | Alta |
| RF03 | Los datos del comprador deben ser editables y validables | Alta |
| RF04 | Las especificaciones del equipo deben tener valores por defecto | Alta |
| RF05 | El resumen económico debe calcular el saldo automáticamente | Alta |
| RF06 | La vista previa debe actualizarse en tiempo real | Alta |
| RF07 | El PDF debe contener todas las secciones: header, partes, equipo, económico, cláusulas, observaciones, firmas | Alta |
| RF08 | El PDF debe incluir logo, numeración de páginas y datos de empresa | Alta |
| RF09 | El formulario debe auto-guardar borrador al escribir | Media |
| RF10 | Al recargar, debe recuperar el borrador automáticamente | Media |
| RF11 | Las 12 cláusulas deben incluirse predefinidas en el PDF | Alta |
| RF12 | El PDF debe descargarse con nombre de archivo dinámico | Media |

---

## 9. Requerimientos No Funcionales

| ID | Descripción | Criterio |
|----|-------------|----------|
| RNF01 | Consistencia visual con el sistema de diseño existente | Misma paleta, tipografía, espaciados |
| RNF02 | Tiempo de generación de PDF < 3 segundos | Medible con console.time |
| RNF03 | Compatibilidad responsive (escritorio 2 columnas, móvil 1 columna) | Mismo patrón que quote/report |
| RNF04 | Sin fugas de memoria (cleanup de timers, subscriptions) | useEffect return cleanup |
| RNF05 | Código limpio sin warnings de compilación | tsc -b sin errores |
| RNF06 | Tipado fuerte sin `any` | TypeScript strict |

---

## 10. Restricciones

| ID | Restricción | Tipo |
|----|-------------|------|
| R01 | El proyecto usa React 19 + TypeScript ~6.0 | Técnica |
| R02 | Los estilos deben usar Tailwind CSS 4 con @theme | Técnica |
| R03 | Los PDFs deben generarse con @react-pdf/renderer 4.x | Técnica |
| R04 | Los formularios deben usar React Hook Form | Técnica |
| R05 | Las validaciones deben usar Zod | Técnica |
| R06 | No se deben agregar nuevas dependencias si es posible | Técnica |

---

## 11. Dependencias

| Dependencia | Tipo | Módulo Afectado |
|-------------|------|-----------------|
| @react-pdf/renderer | Externa | ContractPDF.tsx |
| react-hook-form | Externa | ContractForm.tsx |
| zod | Externa | validation.ts |
| lucide-react | Externa | App.tsx (icono) |
| Componentes UI existentes | Interna | ContractForm.tsx |

---

## 12. Supuestos y Decisiones de Diseño

| ID | Supuesto/Decisión | Justificación | Impacto |
|----|-------------------|---------------|---------|
| S01 | Los datos del vendedor se precargan con los de NEW POWER ENERGY S.A.S. | Es el único vendedor en la aplicación | Simplifica el formulario |
| S02 | Las cláusulas son fijas y no editables desde el formulario | Son textos legales estándar | Se renderizan directamente en el PDF |
| S03 | El contrato es para una planta eléctrica usada de 500 KVA | Especificación del negocio | Campos de equipo preconfigurados |
| S04 | Los totales económicos tienen valores por defecto | Basado en contratos existentes ($65M, $45M, $20M) | Agiliza la creación |

---

## 13. Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Inconsistencia en estilos del PDF | Baja | Medio | Revisar QuotePDF.tsx y ReportPDF.tsx como referencia |
| Breaking changes en dependencias | Baja | Alto | Usar versiones existentes en package.json |
| Problemas de layout en PDF con @react-pdf | Media | Medio | Usar Flexbox, probar con datos reales |
| Conflictos de merge con código existente | Baja | Medio | Trabajar en feature branch aislada |

---

## 14. Estrategia de Implementación

1. Crear tipos e interfaces (`types.ts`)
2. Crear esquemas de validación (`validation.ts`)
3. Crear lógica de cálculo (`calculations.ts`)
4. Crear helpers de almacenamiento (`storage.ts`)
5. Crear hook de formulario (`useContractForm.ts`)
6. Crear componente de formulario (`ContractForm.tsx`)
7. Crear componente de vista previa (`ContractPreview.tsx`)
8. Crear componente PDF (`ContractPDF.tsx`)
9. Integrar en App.tsx (nuevo botón + ruta)
10. Probar compilación y generación de PDF

---

## 15. Criterios de Aceptación

- [ ] El formulario muestra todos los campos especificados
- [ ] La vista previa se actualiza en tiempo real
- [ ] El PDF generado contiene header con logo y datos de la empresa
- [ ] El PDF contiene datos del vendedor, comprador, equipo y económicos
- [ ] El PDF incluye las 12 cláusulas
- [ ] El PDF incluye sección de observaciones
- [ ] El PDF incluye espacio para firmas
- [ ] El proyecto compila sin errores (`npm run build`)
- [ ] No hay warnings de lint (`npm run lint`)
- [ ] El módulo es responsive (2 columnas escritorio, 1 columna móvil)

---

## 16. Plan de Pruebas

| Prueba | Descripción | Tipo |
|--------|-------------|------|
| P01 | Renderizado del formulario con valores por defecto | Visual |
| P02 | Edición de campos del comprador | Funcional |
| P03 | Cálculo automático del saldo | Unitario |
| P04 | Vista previa refleja cambios en tiempo real | Integración |
| P05 | Generación de PDF con datos completos | Funcional |
| P06 | Auto-guardado y recuperación de borrador | Funcional |
| P07 | Responsive: 2 columnas en escritorio, 1 en móvil | Visual |
| P08 | Compilación sin errores | Build |
