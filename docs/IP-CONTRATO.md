# Implementation Plan (IP)
## Módulo: Contrato de Compraventa — New Power Energy S.A.S.

**Versión:** 1.0
**Fecha:** 2026-07-15
**Destinado a:** Equipos de desarrollo humanos y agentes de IA (OpenCop, Codex, Cursor, Claude Code, Gemini CLI, Windsurf, Roo Code, etc.)

---

## Instrucciones para Agentes de IA

Este documento descompone el proyecto en tareas ejecutables secuencialmente. Cada tarea tiene una única responsabilidad, dependencias explícitas, criterios de validación claros y verificaciones automáticas. NO te saltes pasos. NO asumas información no documentada. Si encuentras una ambigüedad, detente y consulta el PTS antes de continuar.

---

## Resumen del Proyecto

| Aspecto | Valor |
|---------|-------|
| **Proyecto** | new-power-cotizador |
| **Módulo** | Contrato de Compraventa |
| **Ruta base** | `src/features/contract/` |
| **Diseño de referencia** | `/home/eduardo/Escritorio/hola` (especificación visual en ASCII) |
| **Contrato existente** | `/home/eduardo/Escritorio/proyecto/Contrato compraventa (1).docx` (solo como referencia de cláusulas) |
| **Logo** | `src/assets/logo.jpeg` |
| **Framework** | React 19 + TypeScript ~6.0 + Vite 8 |
| **Estilos** | Tailwind CSS 4 (config en `index.css`) |
| **PDF** | @react-pdf/renderer 4.x |
| **Forms** | React Hook Form 7.80 + Zod 4.4 |
| **Despliegue** | Cloudflare Workers |

---

## Evaluación Continua del Progreso

| Fase | % Proyecto | Entregables | Funcionalidades |
|------|-----------|-------------|-----------------|
| 1 (Setup tipos) | 5% | types.ts, validation.ts | — |
| 2 (Lógica) | 15% | calculations.ts, storage.ts, format.ts | — |
| 3 (Formulario) | 40% | useContractForm.ts, ContractForm.tsx | Formulario completo con datos |
| 4 (Vista previa) | 55% | ContractPreview.tsx | Vista previa en tiempo real |
| 5 (PDF) | 80% | ContractPDF.tsx | Generación de PDF completo |
| 6 (Integración) | 90% | App.tsx modificado | Módulo accesible desde home |
| 7 (Validación) | 100% | Build exitoso, lint OK | Todo integrado y verificado |

---

## Gestión de Prioridades

| Prioridad | Significado |
|-----------|-------------|
| **Crítica** | Sin esto el módulo no funciona |
| **Alta** | Funcionalidad central del módulo |
| **Media** | Mejora significativa de UX |
| **Baja** | Pulido estético o futuro |

---

## Clasificación del Esfuerzo

| Clasificación | Tiempo estimado | Tareas típicas |
|---------------|----------------|----------------|
| Muy bajo | < 5 min | Crear archivo de tipos, constants |
| Bajo | 5–15 min | Crear hook simple, lógica pequeña |
| Medio | 15–30 min | Componente de formulario, vista previa |
| Alto | 30–60 min | Componente PDF complejo |
| Muy alto | 60+ min | Integración completa + testing |

---

## Fase 1: Tipos y Validación (Esfuerzo: Bajo, Prioridad: Crítica)

### Tarea 1.1 — Crear types.ts

**Archivo:** `src/features/contract/types.ts`

**Instrucciones:**
Crear las interfaces de TypeScript para el módulo Contrato de Compraventa:

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
  saldo: number
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

**Criterios de validación:**
- [ ] Archivo creado en `src/features/contract/types.ts`
- [ ] No hay errores de sintaxis TypeScript
- [ ] Las interfaces exportadas son correctas

### Tarea 1.2 — Crear validation.ts

**Archivo:** `src/features/contract/logic/validation.ts`

**Instrucciones:**
Crear esquemas Zod para validación del formulario. Los campos obligatorios son: comprador.nombre, comprador.ccNit. El resto son opcionales o tienen valores por defecto. Usar `zod/v3` (como en el módulo quote).

```typescript
import { z } from 'zod/v3'

export const contratoSchema = z.object({
  numero: z.string(),
  fecha: z.string(),
  vendedor: z.object({
    razonSocial: z.string(),
    nit: z.string(),
    direccion: z.string(),
    ciudad: z.string(),
    telefono: z.string(),
    correo: z.string(),
  }),
  comprador: z.object({
    nombre: z.string().min(1, 'El nombre del comprador es obligatorio'),
    ccNit: z.string().min(1, 'El CC/NIT es obligatorio'),
    direccion: z.string().optional().default(''),
    ciudad: z.string().optional().default(''),
    telefono: z.string().optional().default(''),
    correo: z.string().optional().default(''),
  }),
  equipo: z.object({
    marca: z.string(),
    potencia: z.string(),
    modelo: z.string(),
    serialMotor: z.string(),
    serialGenerador: z.string(),
    horas: z.coerce.number().nonnegative().default(0),
    voltaje: z.string(),
    frecuencia: z.string(),
    radiador: z.boolean().default(true),
    breaker: z.boolean().default(true),
    modulo: z.boolean().default(true),
    baterias: z.coerce.number().nonnegative().default(2),
  }),
  economico: z.object({
    valorTotal: z.coerce.number().nonnegative().default(65000000),
    pagoInicial: z.coerce.number().nonnegative().default(45000000),
    saldo: z.coerce.number().nonnegative().default(20000000),
    fechaLimite: z.string().optional().default(''),
  }),
  observaciones: z.string().optional().default(''),
})

export type ContratoFormData = z.infer<typeof contratoSchema>
```

**Criterios de validación:**
- [ ] Archivo creado correctamente
- [ ] Esquema valida correctamente campos obligatorios
- [ ] Usa `zod/v3` (consistente con el proyecto)

---

## Fase 2: Lógica de Negocio (Esfuerzo: Bajo, Prioridad: Alta)

### Tarea 2.1 — Crear calculations.ts

**Archivo:** `src/features/contract/logic/calculations.ts`

**Instrucciones:**
Función para calcular el saldo automáticamente:

```typescript
export function calcularSaldo(valorTotal: number, pagoInicial: number): number {
  return Math.max(0, valorTotal - pagoInicial)
}
```

**Criterios de validación:**
- [ ] Archivo creado
- [ ] Función `calcularSaldo` exportada

### Tarea 2.2 — Crear storage.ts

**Archivo:** `src/features/contract/lib/storage.ts`

**Instrucciones:**
Replicar el patrón de `src/features/quote/lib/storage.ts` para auto-guardado de borrador. Usar claves `npc-contract-numero` y `npc-contract-borrador`.

```typescript
const STORAGE_KEY = 'npc-contract-borrador'
const NUMERO_KEY = 'npc-contract-numero'

export function getSiguienteNumero(): string {
  const ultimo = getUltimoCorrelativo()
  const siguiente = ultimo + 1
  guardarCorrelativo(siguiente)
  return `CC-${String(siguiente).padStart(3, '0')}`
}

export function getUltimoCorrelativo(): number {
  try {
    return Number(localStorage.getItem(NUMERO_KEY)) || 0
  } catch {
    return 0
  }
}

function guardarCorrelativo(num: number): void {
  try {
    localStorage.setItem(NUMERO_KEY, String(num))
  } catch { /* ignore quota errors */ }
}

export function guardarBorrador<T>(data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

export function cargarBorrador<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function borrarBorrador(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}
```

**Criterios de validación:**
- [ ] Archivo creado
- [ ] Claves de almacenamiento únicas (prefijo `npc-contract-`)

### Tarea 2.3 — Crear format.ts

**Archivo:** `src/features/contract/lib/format.ts`

**Instrucciones:**
Helpers de formateo:

```typescript
export const formatCurrency = (n: number): string =>
  '$ ' + Math.round(n).toLocaleString('es-CO')

export const formatDate = (date: string): string => {
  if (!date) return ''
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

**Criterios de validación:**
- [ ] Archivo creado
- [ ] Mismo formato de moneda que el módulo quote

---

## Fase 3: Hook de Formulario (Esfuerzo: Medio, Prioridad: Crítica)

### Tarea 3.1 — Crear useContractForm.ts

**Archivo:** `src/features/contract/hooks/useContractForm.ts`

**Instrucciones:**
Crear hook que gestione el formulario con React Hook Form + useForm, autoguardado con debounce, y recuperación de borrador. Seguir exactamente el patrón de `useQuoteForm.ts`.

Valores por defecto del vendedor (NEW POWER ENERGY S.A.S.):
- razonSocial: "NEW POWER ENERGY S.A.S."
- nit: "901.826.285-6"
- direccion: "Villavicencio, Meta"
- ciudad: "Villavicencio"
- telefono: "(57) 3204931541"
- correo: ""

Valores por defecto del equipo:
- marca: "Detroit"
- potencia: "500 KVA"
- radiador: true
- breaker: true
- modulo: true
- baterias: 2

Valores por defecto económicos:
- valorTotal: 65000000
- pagoInicial: 45000000
- saldo: 20000000

**Criterios de validación:**
- [ ] Hook creado siguiendo patrón de `useQuoteForm`
- [ ] Auto-guardado con debounce de 1500ms
- [ ] Recuperación de borrador al iniciar
- [ ] Función `empezarNueva` que resetea valores

---

## Fase 4: Componente de Formulario (Esfuerzo: Alto, Prioridad: Crítica)

### Tarea 4.1 — Crear ContractForm.tsx

**Archivo:** `src/features/contract/components/ContractForm.tsx`

**Instrucciones:**
Crear el formulario con secciones usando los componentes UI existentes (Card, Input, TextArea, etc.). Incluir:

1. **Card: Datos del Vendedor** — Razón social, NIT, Dirección, Ciudad, Teléfono, Correo
2. **Card: Datos del Comprador** — Nombre, CC/NIT, Dirección, Ciudad, Teléfono, Correo
3. **Card: Especificaciones del Equipo** — Marca, Potencia, Modelo, Serial Motor, Serial Generador, Horas, Voltaje, Frecuencia, Radiador (checkbox), Breaker (checkbox), Módulo (checkbox), Baterías (number)
4. **Card: Resumen Económico** — Valor total, Pago inicial, Saldo (auto-calculado, readonly), Fecha límite
5. **Card: Observaciones** — TextArea multilínea

Para los checkboxes, se puede usar un input type="checkbox" con estilo Tailwind básico (no hay componente Checkbox existente, crear inline).

Para el saldo, usar `useWatch` para escuchar valorTotal y pagoInicial, y calcular saldo = valorTotal - pagoInicial en tiempo real.

**Criterios de validación:**
- [ ] Componente renderiza todas las secciones
- [ ] Campos del vendedor precargados
- [ ] Saldo se calcula automáticamente
- [ ] Inputs usan componentes reutilizables existentes

### Tarea 4.2 — Crear ContractPreview.tsx

**Archivo:** `src/features/contract/components/ContractPreview.tsx`

**Instrucciones:**
Crear vista previa que refleje el diseño del contrato. Usar `useWatch` para suscribirse a cambios. Mostrar:

- Header: Logo (desde `src/assets/logo.jpeg`) + datos empresa + título "CONTRATO DE COMPRAVENTA"
- Sección VENDEDOR: datos del vendedor
- Sección COMPRADOR: datos del comprador  
- Sección ESPECIFICACIONES: tabla con los campos del equipo
- Sección ECONÓMICO: valor total, pago inicial, saldo, fecha límite
- Sección CLÁUSULAS: lista de 12 cláusulas (textos fijos)
- Sección OBSERVACIONES: texto editable
- Sección FIRMAS: espacios para Vendedor y Comprador
- Botón "Generar PDF"

**Criterios de validación:**
- [ ] Vista previa se actualiza en tiempo real
- [ ] Mismo layout que el diseño especificado
- [ ] Botón "Generar PDF" presente

---

## Fase 5: Componente PDF (Esfuerzo: Alto, Prioridad: Crítica)

### Tarea 5.1 — Crear ContractPDF.tsx

**Archivo:** `src/features/contract/pdf/ContractPDF.tsx`

**Instrucciones:**
Crear componente PDF con @react-pdf/renderer siguiendo el patrón de `QuotePDF.tsx`. Debe incluir:

1. **Header** (fijo): Logo + "NEW POWER ENERGY S.A.S." + NIT + "CONTRATO DE COMPRAVENTA"
2. **Datos del Vendedor**: todos los campos
3. **Datos del Comprador**: todos los campos
4. **Especificaciones del Equipo**: tabla con Marca, Potencia, Modelo, Serial Motor, Serial Generador, Horas, Voltaje, Frecuencia, Radiador (Sí/No), Breaker (Sí/No), Módulo (Sí/No), Baterías
5. **Resumen Económico**: Valor total, Pago inicial, Saldo, Fecha límite
6. **Cláusulas**: 12 cláusulas predefinidas (usar textos del contrato existente como referencia)
7. **Observaciones**: texto editable
8. **Firmas**: "EL VENDEDOR" y "EL COMPRADOR" con espacios para Firma, Nombre, C.C./Cargo
9. **Footer**: "Página X de Y"

Cláusulas predefinidas:

```
PRIMERA. OBJETO
EL VENDEDOR vende a EL COMPRADOR una planta eléctrica de segunda, con las siguientes características: [especificaciones del equipo]. Lo anterior conforme a la cotización No. [número].

SEGUNDA. VALOR
El valor total de la compraventa es de: [Valor total en letras y número].

TERCERA. FORMA DE PAGO
EL COMPRADOR pagará el valor del contrato de la siguiente manera: [Pago inicial] como pago inicial y [Saldo] a [fecha límite].

CUARTA. ENTREGA
EL VENDEDOR hará entrega de la planta eléctrica en la ciudad de Medellín, una vez se cumplan las condiciones de pago pactadas entre las partes.

QUINTA. GARANTÍA
La planta eléctrica cuenta con una garantía de quinientas (500) horas de funcionamiento o tres (3) meses, lo que ocurra primero.

SEXTA. INSTALACIÓN Y TRANSPORTE
En caso de requerirse instalación, los gastos de transporte, viáticos y demás costos asociados serán asumidos por EL COMPRADOR.

SÉPTIMA. ESTADO DEL BIEN
EL COMPRADOR declara conocer que el equipo objeto de este contrato corresponde a una planta eléctrica usada (de segunda), aceptando su estado de funcionamiento al momento de la entrega.

OCTAVA. PERFECCIONAMIENTO
El presente contrato se entiende perfeccionado con la firma de las partes.

NOVENA. OBLIGACIONES DEL VENDEDOR
EL VENDEDOR se obliga a entregar el equipo en el estado acordado, con todos sus accesorios y documentación asociada.

DÉCIMA. OBLIGACIONES DEL COMPRADOR
EL COMPRADOR se obliga a pagar el valor acordado en la forma y plazos estipulados.

UNDÉCIMA. INCUMPLIMIENTO
En caso de incumplimiento por cualquiera de las partes, la parte afectada podrá exigir el cumplimiento o la resolución del contrato.

DUODÉCIMA. CLÁUSULA PENAL
En caso de mora en el pago, EL COMPRADOR pagará un interés moratorio equivalente al máximo legal permitido.
```

Usar la misma fuente Inter registrada. El tamaño de página debe ser LETTER (como los otros PDFs).

Nombre de archivo: `Contrato-{numero}.pdf`

**Criterios de validación:**
- [ ] Componente PDF creado
- [ ] Incluye header con logo
- [ ] Incluye todas las secciones del diseño
- [ ] Incluye las 12 cláusulas
- [ ] Incluye numeración de páginas
- [ ] Nombre de archivo dinámico

---

## Fase 6: Integración en App.tsx (Esfuerzo: Medio, Prioridad: Crítica)

### Tarea 6.1 — Modificar App.tsx

**Archivo:** `src/App.tsx`

**Instrucciones:**
Agregar el nuevo módulo 'contract' a la aplicación:

1. Agregar `'contract'` al type `Modulo`
2. Importar icono `FileSignature` de lucide-react
3. Importar hooks y componentes del nuevo módulo
4. Agregar nuevo botón en la pantalla de home (entre quote y report, o al final)
5. Agregar el caso `modulo === 'contract'` en el render principal (mismo patrón que quote/report: formulario izquierda, preview derecha)
6. Agregar manejo de borrador (similar a quote/report)

Para el botón de home:
```tsx
<button onClick={() => setModulo('contract')} className="group">
  <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
      <FileSignature size={32} className="text-brand-orange-dark" />
    </div>
    <h3 className="text-lg font-bold text-brand-dark mb-2">Contrato de compraventa</h3>
    <p className="text-sm text-brand-gray">Genera un contrato de compraventa con cláusulas y firmas</p>
  </Card>
</button>
```

**Criterios de validación:**
- [ ] Botón visible en home
- [ ] Navegación al módulo funciona
- [ ] Volver a home funciona
- [ ] No se rompen otros módulos

---

## Fase 7: Validación y Verificación (Esfuerzo: Medio, Prioridad: Alta)

### Tarea 7.1 — Verificar compilación

```bash
npm run build
```

Debe compilar sin errores.

### Tarea 7.2 — Verificar lint

```bash
npm run lint
```

Debe pasar sin errores.

### Tarea 7.3 — Verificar tests existentes

```bash
npm run test
```

Los tests existentes deben seguir pasando.

### Tarea 7.4 — Verificación visual manual

1. Abrir la app en navegador
2. Verificar que aparece el botón "Contrato de compraventa" en home
3. Hacer clic y verificar que se renderiza el formulario
4. Completar campos y verificar vista previa en tiempo real
5. Generar PDF y verificar que contiene toda la información

---

## Gestión de Riesgos por Fase

| Fase | Riesgo | Prob. | Impacto | Mitigación |
|------|--------|-------|---------|------------|
| 1 | Tipos incorrectos | Baja | Medio | Revisar contra el diseño en `hola` |
| 2 | Error en cálculo de saldo | Baja | Medio | Validar con valores de prueba |
| 3 | Hook no recupera borrador | Media | Medio | Probar recarga del navegador |
| 4 | Layout del formulario desalineado | Media | Bajo | Usar mismo patrón de QuoteForm |
| 5 | PDF no renderiza logo | Media | Alto | Ver ruta del asset, probar con ruta absoluta |
| 5 | Layout del PDF incorrecto | Media | Alto | Usar Flexbox, probar con datos reales |
| 6 | Conflicto en App.tsx | Baja | Alto | No modificar código existente, solo agregar |
| 7 | Build falla | Baja | Alto | Corregir errores de compilación |

---

## Gestión de Supuestos

| Supuesto | Descripción | Justificación | Validación |
|----------|-------------|---------------|------------|
| S01 | Logo existe en `src/assets/logo.jpeg` | Verificado en el filesystem | Confirmado |
| S02 | @react-pdf/renderer puede cargar logo local | Usa Image con src relativa | Probar build |
| S03 | Numeración CC-001 es independiente | Nueva clave en localStorage | Confirmado |

---

## Criterios de Éxito

- [ ] `npm run build` exitoso
- [ ] `npm run lint` sin errores
- [ ] Formulario renderiza todos los campos especificados
- [ ] Vista previa se actualiza en tiempo real
- [ ] PDF contiene: header, vendedor, comprador, equipo, económico, 12 cláusulas, observaciones, firmas
- [ ] PDF se descarga con nombre de archivo correcto
- [ ] Borrador se guarda y recupera correctamente
- [ ] Módulo responsive (2 columnas ≥1024px, 1 columna <1024px)
- [ ] Los módulos existentes (quote, report, contabilidad) siguen funcionando

---

## Comandos de Verificación

```bash
# Compilar
npm run build

# Lint
npm run lint

# Tests
npm run test
```
