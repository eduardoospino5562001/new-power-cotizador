# Documento Técnico — Módulo de Contabilidad

## Generación de Comprobantes Contables desde Excel

---

## 1. Visión General

El módulo **Contabilidad** permite a un usuario cargar un archivo Excel con datos de ingresos, configurar parámetros contables y generar un archivo Excel de salida con comprobantes contables listos para importar en un sistema de contabilidad (tipo SGCT). Es una aplicación 100% frontend (React + Vite + TypeScript) sin backend: todo el procesamiento ocurre en el navegador mediante la librería `xlsx`.

---

## 2. Jerarquía del Módulo

```
src/features/contabilidad/
├── Contabilidad.tsx                  # Punto de entrada del módulo (orquestador)
├── types.ts                          # Interfaces y tipos de datos
├── hooks/
│   └── useComprobantesForm.ts        # Hook principal: estado, lógica de negocio, generación
├── lib/
│   ├── excelUtils.ts                 # Constantes, mapas de cuentas, normalización, parsers
│   ├── excelReader.ts                # Lectura y escaneo del archivo Excel de origen
│   └── excelExporter.ts             # Escritura del archivo Excel de salida (plantilla + datos)
└── components/
    ├── ComprobantesForm.tsx          # Formulario: carga de archivo, parámetros, cuentas contables
    ├── ComprobantesPreview.tsx       # Vista previa de la configuración actual
    └── ResultView.tsx                # Visor paginado del Excel generado
```

---

## 3. Estructura de Archivos y Responsabilidades

### 3.1 `types.ts` — Definiciones de tipos

| Tipo | Propósito |
|------|-----------|
| `SourceRow` | Representa una fila del Excel de origen ya procesada (lote, fecha, medio, monto, etiqueta, recibo, tercero, cuota) |
| `ProjectInfo` | Metadatos de un proyecto: total de filas y cuántas no tienen monto |
| `AccountMap` | Mapa que asocia cada **concepto contable** (`EFECTIVO`, `BONIFICACION`, `CTA_ARQ`, `CTA_KATHE`, `BANCOLOMBIA`, `DAVIVIENDA`) con un **código de cuenta numérico** |
| `ScanResult` | Resultado del escaneo inicial del Excel: proyectos detectados, años y meses disponibles |
| `OutputRow` | Una línea de comprobante contable en el formato de salida (28 campos) |

### 3.2 `excelUtils.ts` — Constantes y utilidades

Es el archivo más importante para entender la configuración actual:

```typescript
// CÓDIGOS DE CUENTA DISPONIBLES (ACCOUNT_CODE_OPTIONS)
EFECTIVO:   11050501   // Cuenta en efectivo
BANCOLOMBIA: 11100504  // Cuenta Bancolombia
DAVIVIENDA:  11100505  // Cuenta Davivienda

// MAPEO DE MEDIO DE PAGO → CLAVE EN AccountMap (SOURCE_MEDIUM_KEYS)
DAVIVIENDA   → DAVIVIENDA
BANCOLOMBIA  → BANCOLOMBIA
EFECTIVO     → EFECTIVO
BONIFICACION → BONIFICACION
CTA ARQ      → CTA_ARQ
CTA KATHE    → CTA_KATHE

// CONSTANTES DEL COMPROBANTE
DEBIT_DEFAULT: 556          // Tipo comprobante fijo
CREDIT_FUND:  '28050501\xa0' // Cuota de fondo (string con NBSP)
CURRENCY_CODE: 'COP'
DOC_TYPE:      'RCBO'       // Tipo de documento
```

#### Función clave: `debitAccountForMedium()`

```typescript
export function debitAccountForMedium(medium: string, accountMap?: AccountMap): number
```

Recibe el texto del medio de pago desde el Excel (ej. "TRANSFERENCIA BANCOLOMBIA") y:
1. Lo normaliza (mayúsculas, sin tildes).
2. Recorre `SOURCE_MEDIUM_KEYS` buscando si el texto **incluye** alguna clave.
3. Si encuentra coincidencia, obtiene la clave del grupo (ej. `BANCOLOMBIA`) y busca en `accountMap` el código numérico asignado.
4. Si no hay coincidencia, retorna por defecto `accountMap.EFECTIVO`.

Este es **el punto crítico** para agregar un nuevo concepto como "Caja".

### 3.3 `excelReader.ts` — Lectura del Excel origen

| Función | Propósito |
|---------|-----------|
| `scanWorkbook(file)` | Lee el archivo, escanea proyectos, años y meses. Retorna `ScanResult`. |
| `scanProjects(ws, maxRow)` | Extrae lista de proyectos desde columna 14 (índice 0). |
| `scanDocumentDates(ws, maxRow)` | Extrae años y meses desde columna 5. |
| `collectSourceRows(ws, maxRow, project, year, month)` | Filtra filas por proyecto/año/mes, valida datos y retorna `SourceRow[]`. |

**Columnas del Excel origen:**
| Col | Campo | Validación |
|-----|-------|------------|
| 0 | Lote | Requerido |
| 3 | ID Tercero | Opcional |
| 4 | Recibo | Opcional |
| 5 | Fecha | Requerido, debe ser Date |
| 6 | Medio de pago | Requerido |
| 7 | Monto | Requerido, numérico |
| 9 | Comprador | Requerido |
| 10 | Etiqueta | Opcional (para identificar cuotas) |
| 14 | Proyecto | Requerido |

### 3.4 `excelExporter.ts` — Generación del Excel de salida

`exportWorkbook()` toma la plantilla `Modelodeimportacion.xlsx` y:
1. Lee ambas hojas (`Datos` y `Hoja1`).
2. Recolecta las filas fuente con `collectSourceRows()`.
3. Por cada fila genera **2 líneas contables** (débito y crédito):
   - **Línea de débito** (filas impares): usa `debitAccountForMedium()` para determinar la cuenta.
   - **Línea de crédito** (filas pares): siempre usa `ACCOUNT.CREDIT_FUND` (cuota de fondo).
4. Escribe los datos en las hojas respetando el formato de la plantilla.

### 3.5 `useComprobantesForm.ts` — Hook principal de estado

Gestiona:
- `sourceFile`, `scanResult` — archivo cargado y metadatos.
- `selectedProject`, `selectedYear`, `selectedMonth` — filtros.
- `startConsecutive` — número de consecutivo inicial.
- `accountMap` — mapa de cuentas contables (estado editable por el usuario).
- `generating`, `error`, `success`, `result` — estados de UI.

**Función `generate()`:** orquesta todo el proceso:
1. Valida campos requeridos.
2. Carga la plantilla (`Modelodeimportacion.xlsx`).
3. Llama a `exportWorkbook()`.
4. Construye `outputRows[]` con el detalle de cada línea generada.
5. Descarga el archivo y almacena el resultado para el visor.

### 3.6 Componentes de UI

| Componente | Propósito |
|------------|-----------|
| `ComprobantesForm` | Formulario con selector de archivo, parámetros (proyecto/año/mes/consecutivo) y configuración de cuentas contables (6 selects) |
| `ComprobantesPreview` | Resumen visual de la configuración actual |
| `ResultView` | Visor paginado del Excel generado con navegación por columnas |

---

## 4. Flujo Completo de Ejecución

```
Usuario                          Frontend (Navegador)
───────                          ─────────────────────

 1. Hace clic en
    "Herramientas contables"      → App.tsx: setModulo('contabilidad')
                                    → Renderiza <Contabilidad />

 2. Ve el módulo                  → 3 tabs: "Archivo de origen",
                                    "Comprobantes contables", "Visor de Excel"

 3. Carga archivo .xlsx           → ComprobantesForm: input file onChange
                                    → loadSource(file)
                                      → scanWorkbook(file)
                                        → XLSX.read() + scanProjects()
                                        + scanDocumentDates()
                                      → setScanResult() con proyectos/años/meses
                                      → Auto-selecciona primer proyecto/año/mes

 4. Configura parámetros          → Selects controlan estado en useComprobantesForm
    (proyecto, año, mes,          → AccountMap se edita mediante 6 Selects que
     consecutivo inicial,          mapean cada concepto a un código de cuenta
     cuentas contables)

 5. Hace clic en                  → generate()
    "Generar Excel"                 → fetch('Modelodeimportacion.xlsx')
                                      → exportWorkbook(template, source, ...)
                                        → collectSourceRows() filtra + valida
                                        → Por cada fila:
                                            1. debitAccountForMedium(medio, accountMap)
                                            2. Escribe fila débito en hoja Datos
                                            3. Escribe fila crédito en hoja Datos
                                        → XLSX.write() genera ArrayBuffer
                                      → Construye outputRows[] para el visor
                                      → saveAs() descarga el archivo
                                      → setResult() habilita tab "Visor de Excel"

 6. Ve el resultado               → Tab "Visor de Excel": ResultView muestra
    en el visor                    tabla paginada con todas las líneas contables
```

---

## 5. Conceptos Contables Actuales

### 5.1 Configuración en `excelUtils.ts`

```typescript
// Línea 3: Códigos de cuenta disponibles
ACCOUNT_CODE_OPTIONS = {
  EFECTIVO: 11050501,
  BANCOLOMBIA: 11100504,
  DAVIVIENDA: 11100505,
}

// Línea 8: Mapeo medio de pago → concepto en AccountMap
SOURCE_MEDIUM_KEYS = [
  ['DAVIVIENDA', 'DAVIVIENDA'],
  ['BANCOLOMBIA', 'BANCOLOMBIA'],
  ['EFECTIVO', 'EFECTIVO'],
  ['BONIFICACION', 'BONIFICACION'],
  ['CTA ARQ', 'CTA ARQ'],
  ['CTA KATHE', 'CTA KATHE'],
]
```

### 5.2 Configuración en `useComprobantesForm.ts` (valores por defecto del `accountMap`)

```typescript
const [accountMap, setAccountMap] = useState<AccountMap>({
  EFECTIVO: ACCOUNT_CODE_OPTIONS.EFECTIVO,       // 11050501
  BONIFICACION: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA, // 11100504
  CTA_ARQ: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,      // 11100504
  CTA_KATHE: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,    // 11100504
  BANCOLOMBIA: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,  // 11100504
  DAVIVIENDA: ACCOUNT_CODE_OPTIONS.DAVIVIENDA,    // 11100505
})
```

### 5.3 Configuración en `AccountMap` (types.ts)

```typescript
export interface AccountMap {
  EFECTIVO: number
  BONIFICACION: number
  CTA_ARQ: number
  CTA_KATHE: number
  BANCOLOMBIA: number
  DAVIVIENDA: number
}
```

### 5.4 En la UI (`ComprobantesForm.tsx`)

Se renderizan 6 Selects, uno por cada concepto:

```
Cuenta efectivo    → accountMap.EFECTIVO
Cuenta bonif.      → accountMap.BONIFICACION
Cuenta CTA ARQ     → accountMap.CTA_ARQ
Cuenta CTA Kathe   → accountMap.CTA_KATHE
Cuenta Bancolombia → accountMap.BANCOLOMBIA
Cuenta Davivienda  → accountMap.DAVIVIENDA
```

### 5.5 En la vista previa (`ComprobantesPreview.tsx`)

Se muestran los 6 valores del accountMap en texto.

---

## 6. Flujo de Datos: Desde el Excel hasta el Comprobante

```
Excel Origen (.xlsx)
│
│ Col 6: Medio de pago (ej. "TRANSFERENCIA BANCOLOMBIA", "EFECTIVO", "BONIFICACION")
│ Col 7: Monto
│ Col 5: Fecha
│ Col 0: Lote
│ Col 10: Etiqueta
│ Col 3: ID Tercero
│ Col 4: Recibo
│ Col 9: Comprador
│ Col 14: Proyecto
│
▼
collectSourceRows()
  │ Filtra por proyecto/año/mes
  │ Valida campos requeridos
  │ Parsea montos (parseCurrency)
  │ Parsea cuotas desde etiqueta (parseInstallment)
  │ Retorna SourceRow[]
  │
  ▼
exportWorkbook()
  │
  │ Por cada SourceRow:
  │   ├─ medium → debitAccountForMedium(medium, accountMap)
  │   │            ├─ Normaliza texto (mayúsculas, sin tildes)
  │   │            ├─ Busca en SOURCE_MEDIUM_KEYS si medium INCLUYE alguna clave
  │   │            └─ Retorna código numérico desde accountMap
  │   │
  │   ├─ OUTPUT FILA DÉBITO:
  │   │   codigoCuenta = debitAccountForMedium()
  │   │   debito = monto
  │   │   credito = null
  │   │
  │   └─ OUTPUT FILA CRÉDITO:
  │       codigoCuenta = ACCOUNT.CREDIT_FUND (28050501)
  │       credito = monto
  │       debito = null
  │       prefijo = 'RCBO'
  │       reciboConsecutivo = receipt
  │       numeroCuota = installment
  │       descripcion = etiqueta-lote
  │
  ▼
XLSX.write() → ArrayBuffer → Blob → saveAs() descarga
                               ↓
                         ResultView (visor web)
```

---

## 7. Plan de Implementación: Agregar Concepto "Caja"

### 7.1 Cambios necesarios (archivo por archivo)

#### 7.1.1 `src/features/contabilidad/types.ts` — Agregar a `AccountMap`

```typescript
export interface AccountMap {
  EFECTIVO: number
  BONIFICACION: number
  CTA_ARQ: number
  CTA_KATHE: number
  BANCOLOMBIA: number
  DAVIVIENDA: number
  CAJA: number          // ← NUEVO
}
```

#### 7.1.2 `src/features/contabilidad/lib/excelUtils.ts` — 2 cambios

**a) Agregar el código de cuenta (si no existe, usar el mismo que EFECTIVO o uno nuevo):**

```typescript
export const ACCOUNT_CODE_OPTIONS: Record<string, number> = {
  EFECTIVO: 11050501,
  BANCOLOMBIA: 11100504,
  DAVIVIENDA: 11100505,
  CAJA: 11050501,       // ← NUEVO: mismo código que efectivo o el que corresponda
}
```

**b) Agregar la entrada en SOURCE_MEDIUM_KEYS:**

```typescript
export const SOURCE_MEDIUM_KEYS: [string, string][] = [
  ['DAVIVIENDA', 'DAVIVIENDA'],
  ['BANCOLOMBIA', 'BANCOLOMBIA'],
  ['EFECTIVO', 'EFECTIVO'],
  ['BONIFICACION', 'BONIFICACION'],
  ['CTA ARQ', 'CTA ARQ'],
  ['CTA KATHE', 'CTA KATHE'],
  ['CAJA', 'CAJA'],      // ← NUEVO
]
```

**Nota:** La lógica en `debitAccountForMedium()` ya es genérica. Detecta si el texto del medio de pago **incluye** la palabra "CAJA" (normalizada), y si existe en el `accountMap`, lo usará automáticamente. No necesita cambios.

#### 7.1.3 `src/features/contabilidad/hooks/useComprobantesForm.ts` — Valor por defecto

```typescript
const [accountMap, setAccountMap] = useState<AccountMap>({
  EFECTIVO: ACCOUNT_CODE_OPTIONS.EFECTIVO,
  BONIFICACION: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
  CTA_ARQ: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
  CTA_KATHE: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
  BANCOLOMBIA: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
  DAVIVIENDA: ACCOUNT_CODE_OPTIONS.DAVIVIENDA,
  CAJA: ACCOUNT_CODE_OPTIONS.CAJA,   // ← NUEVO
})
```

#### 7.1.4 `src/features/contabilidad/components/ComprobantesForm.tsx` — UI

Agregar un nuevo Select después de "Cuenta Davivienda":

```tsx
<Select
  label="Cuenta Caja"
  options={ACCOUNT_OPTIONS}
  value={Object.entries(ACCOUNT_CODE_OPTIONS).find(([, v]) => v === accountMap.CAJA)?.[0] ?? 'CAJA'}
  onChange={(e) => updateAccount('CAJA', e.target.value)}
/>
```

#### 7.1.5 `src/features/contabilidad/components/ComprobantesPreview.tsx` — Vista previa

Agregar línea de resumen:

```tsx
<p><span className="text-brand-gray">Caja:</span> {accountMap.CAJA}</p>
```

### 7.2 Impacto del cambio

| Aspecto | Impacto |
|---------|---------|
| `types.ts` | Se agrega 1 campo a `AccountMap`. **Sin cambios** en `SourceRow`, `OutputRow` ni otras interfaces. |
| `excelUtils.ts` | Se agrega 1 entrada en `ACCOUNT_CODE_OPTIONS` y 1 en `SOURCE_MEDIUM_KEYS`. |
| `useComprobantesForm.ts` | Se agrega 1 línea en el estado inicial de `accountMap`. |
| `ComprobantesForm.tsx` | Se agrega 1 Select en el formulario. |
| `ComprobantesPreview.tsx` | Se agrega 1 línea en la vista previa. |
| `excelReader.ts` | **Sin cambios** — ya lee la columna "Medio de pago" genéricamente. |
| `excelExporter.ts` | **Sin cambios** — ya usa `debitAccountForMedium()` que es genérica. |
| `Contabilidad.tsx` | **Sin cambios**. |
| `ResultView.tsx` | **Sin cambios**. |

### 7.3 Cómo viajaría el dato "Caja" desde el Excel

1. El usuario tiene una fila en el Excel donde la columna 6 (Medio de pago) dice, por ejemplo, `"CAJA"`, `"PAGO EN CAJA"` o `"CAJA GENERAL"`.
2. `collectSourceRows()` extrae `medium = "CAJA"` (o lo que sea).
3. `debitAccountForMedium("CAJA", accountMap)`:
   - Normaliza a `"CAJA"`.
   - Itera `SOURCE_MEDIUM_KEYS`: encuentra `['CAJA', 'CAJA']`.
   - Toma `accountMap.CAJA` que es el código numérico configurado.
4. Se genera la línea de débito con `codigoCuenta = accountMap.CAJA`.
5. El usuario puede cambiar a qué código contable apunta "Caja" desde el Select en el formulario.

### 7.4 Pruebas recomendadas

1. Cargar un Excel con filas cuyo medio de pago sea `"CAJA"`, `"Pago en caja"`, `"CAJA PRINCIPAL"`.
2. Verificar que el `debitAccountForMedium()` normalice y detecte correctamente.
3. Verificar que el Select "Cuenta Caja" aparezca y permita cambiar el código contable.
4. Verificar que el Excel generado contenga el código de cuenta correcto en las líneas de débito.
5. Verificar que el visor muestre la información correcta.

---

## 8. Resumen de Puntos de Extensión

| Punto de extensión | Archivo | Naturaleza |
|-------------------|---------|------------|
| Nuevo concepto contable | `types.ts` (AccountMap) | Tipo |
| Código de cuenta por defecto | `excelUtils.ts` (ACCOUNT_CODE_OPTIONS) | Constante |
| Mapeo texto-medium → concepto | `excelUtils.ts` (SOURCE_MEDIUM_KEYS) | Constante |
| Default del accountMap | `useComprobantesForm.ts` | Estado inicial |
| Select en formulario | `ComprobantesForm.tsx` | UI |
| Vista previa | `ComprobantesPreview.tsx` | UI |

El diseño actual es altamente mantenible: agregar un nuevo concepto requiere tocar **exactamente 5 archivos** con cambios triviales y **ninguna lógica de negocio** se ve afectada, porque `debitAccountForMedium()` y todo el pipeline de exportación son completamente genéricos.
