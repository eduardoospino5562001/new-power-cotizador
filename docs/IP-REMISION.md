# Implementation Plan (IP)
## Módulo: Remisión — New Power Energy S.A.S.

**Versión:** 1.0
**Fecha:** 2026-07-15
**Destinado a:** Agentes de IA (OpenCop, Codex, Cursor, Claude Code, Gemini CLI, Windsurf, Roo Code, etc.)

---

## Instrucciones para Agentes de IA

Este documento descompone el proyecto en tareas ejecutables secuencialmente. Cada tarea tiene una única responsabilidad, dependencias explícitas, criterios de validación claros y verificaciones automáticas. NO te saltes pasos. NO asumas información no documentada.

---

## Resumen del Proyecto

| Aspecto | Valor |
|---------|-------|
| **Proyecto** | new-power-cotizador |
| **Módulo** | Remisión |
| **Ruta base** | `src/features/remision/` |
| **Diseño de referencia** | `/home/eduardo/Escritorio/hola` (mockup en ASCII) |
| **Documento existente** | `/home/eduardo/Escritorio/proyecto/REMISION.docx` (referencia funcional) |
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
| 2 (Infraestructura) | 15% | storage.ts, format.ts | — |
| 3 (Hook) | 25% | useRemisionForm.ts | Lógica de formulario + borrador |
| 4 (Formulario) | 50% | RemisionForm.tsx | Formulario completo |
| 5 (Vista previa) | 65% | RemisionPreview.tsx | Vista previa en tiempo real |
| 6 (PDF) | 85% | RemisionPDF.tsx + useGenerateRemisionPdf.tsx | Generación de PDF |
| 7 (Integración) | 95% | App.tsx modificado | Módulo accesible desde home |
| 8 (Validación + Deploy) | 100% | Build, lint, test, commit, push, deploy | Todo verificado y publicado |

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

**Archivo:** `src/features/remision/types.ts`

**Instrucciones:**
Crear las interfaces de TypeScript para el módulo Remisión:

```typescript
export interface Cliente {
  nombre: string
  ccNit: string
  direccion: string
  ciudad: string
  telefono: string
}

export interface InformacionLogistica {
  lugarDespacho: string
  lugarEntrega: string
  responsableTransporte: string
  vehiculo: string
  placa: string
}

export interface DetalleItem {
  id: string
  cantidad: string
  codigo: string
  descripcion: string
  serial: string
  observaciones: string
}

export interface FirmaInfo {
  nombre: string
  cargo: string
  documento: string
  fecha: string
  hora: string
}

export interface Remision {
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

**Criterios de validación:**
- [ ] Archivo creado en `src/features/remision/types.ts`
- [ ] No hay errores de sintaxis TypeScript
- [ ] Las interfaces exportadas son correctas

### Tarea 1.2 — Crear validation.ts

**Archivo:** `src/features/remision/logic/validation.ts`

**Instrucciones:**
Crear esquemas Zod para validación del formulario. Campos obligatorios: `cliente.nombre`, `cliente.ccNit`. El resto opcionales o con defaults.

**Criterios de validación:**
- [ ] Archivo creado correctamente
- [ ] Esquema valida campos obligatorios
- [ ] Usa `zod/v3` (consistente con el proyecto)

---

## Fase 2: Infraestructura (Esfuerzo: Bajo, Prioridad: Alta)

### Tarea 2.1 — Crear storage.ts

**Archivo:** `src/features/remision/lib/storage.ts`

**Instrucciones:**
Mismo patrón que `src/features/contrato/lib/storage.ts`. Claves: `npc-remision-borrador`, `npc-remision-numero`. Formato de número: `R-001`.

**Criterios de validación:**
- [ ] Archivo creado
- [ ] Claves de almacenamiento únicas (prefijo `npc-remision-`)

### Tarea 2.2 — Crear format.ts

**Archivo:** `src/features/remision/lib/format.ts`

**Instrucciones:**
Helper `formatDate` (reutilizar el mismo de contrato).

**Criterios de validación:**
- [ ] Archivo creado
- [ ] Mismo formato de fecha que el módulo contrato

---

## Fase 3: Hook de Formulario (Esfuerzo: Medio, Prioridad: Crítica)

### Tarea 3.1 — Crear useRemisionForm.ts

**Archivo:** `src/features/remision/hooks/useRemisionForm.ts`

**Instrucciones:**
Crear hook que gestione el formulario con React Hook Form + useForm, autoguardado con debounce (1500ms), recuperación de borrador, y useFieldArray para `detalles`.

Valores por defecto:
- `logistica.lugarDespacho`: "Villavicencio"
- `logistica.lugarEntrega`: "Medellín"
- `detalles`: un item default con cantidad "1", código "PL-450", descripción "Planta eléctrica 450 KVA", observaciones "Motor Detroit"

Exponer: `...form`, `control`, `detFields`, `appendDet`, `removeDet`, `empezarNueva`.

**Criterios de validación:**
- [ ] Hook creado siguiendo patrón de `useContractForm`
- [ ] Auto-guardado con debounce de 1500ms
- [ ] Recuperación de borrador al iniciar
- [ ] useFieldArray para detalles con fallback de inicialización
- [ ] Función `empezarNueva` que resetea valores

---

## Fase 4: Componente de Formulario (Esfuerzo: Alto, Prioridad: Crítica)

### Tarea 4.1 — Crear RemisionForm.tsx

**Archivo:** `src/features/remision/components/RemisionForm.tsx`

**Instrucciones:**
Crear el formulario con secciones usando los componentes UI existentes (Card, Input, TextArea, Button):

1. **Card: Encabezado** — N.º Remisión, Fecha, N.º Pedido, N.º Contrato
2. **Card: Cliente** — Nombre, CC/NIT, Dirección, Ciudad, Teléfono
3. **Card: Información Logística** — Lugar despacho, Lugar entrega, Responsable transporte, Vehículo, Placa
4. **Card: Detalle de Entrega** (dinámico con useFieldArray):
   - Checkbox por item para selección múltiple
   - Campos: Cantidad, Código, Descripción, Serial, Observaciones
   - Botones: "Eliminar seleccionados", "Eliminar todos", "Agregar"
   - Botón individual de eliminar por item
5. **Card: Observaciones** — TextArea multilínea
6. **Card: Firmas** — Dos columnas (Entrega / Recibe), cada una con: Nombre, Cargo, Documento, Fecha, Hora

Para la selección múltiple, mantener un `useState<Set<number>>` con los índices seleccionados. Al eliminar, ordenar índices de mayor a menor para evitar problemas de re-indexación.

**Ícono para botón Agregar:** `Plus` de lucide-react
**Ícono para botón Eliminar:** `Trash2` de lucide-react

**Criterios de validación:**
- [ ] Componente renderiza todas las secciones
- [ ] Detalle de entrega permite agregar/editar/eliminar items
- [ ] Selección múltiple funcional (individual, varios, todos)
- [ ] Inputs usan componentes reutilizables existentes

---

## Fase 5: Vista Previa (Esfuerzo: Medio, Prioridad: Alta)

### Tarea 5.1 — Crear RemisionPreview.tsx

**Archivo:** `src/features/remision/components/RemisionPreview.tsx`

**Instrucciones:**
Crear vista previa que refleje el diseño de la remisión. Usar `useWatch` para suscribirse a cambios. Mostrar:

- Header: Logo + datos empresa + título "REMISIÓN" + No., Fecha, Pedido, Contrato
- Sección CLIENTE: datos del cliente
- Sección INFORMACIÓN LOGÍSTICA: lugar despacho, lugar entrega, responsable, vehículo, placa
- Sección DETALLE DE ENTREGA: tabla con Cant., Código, Descripción, Serial, Observaciones
- Sección OBSERVACIONES
- Sección FIRMAS: dos columnas (Entrega / Recibe)
- Botón "Generar PDF"

**Criterios de validación:**
- [ ] Vista previa se actualiza en tiempo real
- [ ] Mismo layout que el diseño especificado
- [ ] Botón "Generar PDF" presente

---

## Fase 6: PDF (Esfuerzo: Alto, Prioridad: Crítica)

### Tarea 6.1 — Crear useGenerateRemisionPdf.tsx

**Archivo:** `src/features/remision/hooks/useGenerateRemisionPdf.tsx`

**Instrucciones:**
Mismo patrón que `useGenerateContractPdf.tsx`. Cargar logo como base64, generar blob, descargar con nombre `Remision-{numero}.pdf`.

### Tarea 6.2 — Crear RemisionPDF.tsx

**Archivo:** `src/features/remision/pdf/RemisionPDF.tsx`

**Instrucciones:**
Crear componente PDF con @react-pdf/renderer siguiendo el patrón de `ContractPDF.tsx`. Debe incluir:

1. **Header**: Logo + "NEW POWER ENERGY S.A.S." + NIT + "REMISIÓN" + No., Fecha, Pedido, Contrato
2. **Cliente**: Nombre, CC/NIT, Dirección, Ciudad, Teléfono
3. **Información Logística**: Lugar despacho, Lugar entrega, Responsable, Vehículo, Placa
4. **Detalle de Entrega**: Tabla con Cant., Código, Descripción, Serial, Observaciones
5. **Observaciones**
6. **Firmas**: Dos secciones (ENTREGA / RECIBE) con Nombre, Cargo, Documento, Fecha, Hora
7. **Footer**: "Página X de Y"

Tamaño de página: LETTER. Fuente: Inter. Usar estilos consistentes con ContractPDF.tsx (mismos colores, tamaños, espaciados).

**Criterios de validación:**
- [ ] Componente PDF creado
- [ ] Incluye header con logo
- [ ] Incluye todas las secciones del diseño
- [ ] Incluye tabla de detalle de entrega
- [ ] Incluye firmas
- [ ] Nombre de archivo dinámico

---

## Fase 7: Integración en App.tsx (Esfuerzo: Medio, Prioridad: Crítica)

### Tarea 7.1 — Modificar App.tsx

**Archivo:** `src/App.tsx`

**Instrucciones:**
Agregar el nuevo módulo `'remision'` a la aplicación:

1. Agregar `'remision'` al type `Modulo`
2. Importar icono `Truck` de lucide-react
3. Importar hooks y componentes del nuevo módulo
4. Agregar nuevo botón en la pantalla de home con icono `Truck`
5. Agregar el caso `modulo === 'remision'` en el render principal (formulario izquierda, preview derecha)
6. Agregar manejo de borrador (mismo patrón que contrato)

Para el botón de home:
```tsx
<button onClick={() => setModulo('remision')} className="group">
  <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
      <Truck size={32} className="text-brand-orange-dark" />
    </div>
    <h3 className="text-lg font-bold text-brand-dark mb-2">Remisión</h3>
    <p className="text-sm text-brand-gray">Genera una remisión con detalle de entrega y firmas</p>
  </Card>
</button>
```

**Criterios de validación:**
- [ ] Botón visible en home con icono Truck
- [ ] Navegación al módulo funciona
- [ ] Volver a home funciona
- [ ] No se rompen otros módulos

---

## Fase 8: Validación y Despliegue (Esfuerzo: Medio, Prioridad: Alta)

### Tarea 8.1 — Verificar compilación

```bash
npm run build
```
Debe compilar sin errores.

### Tarea 8.2 — Verificar lint

```bash
npm run lint
```
Debe pasar sin errores ni warnings.

### Tarea 8.3 — Verificar tests existentes

```bash
npm run test
```
Los tests existentes deben seguir pasando.

### Tarea 8.4 — Commit y push

```bash
git add -A
git commit -m "feat: add remision module with form, preview, PDF, and bulk selection"
git push origin main
```

### Tarea 8.5 — Deploy a Cloudflare

```bash
CLOUDFLARE_API_TOKEN=<token> npx wrangler deploy --assets dist
```

### Tarea 8.6 — Verificación en producción

Acceder a https://new-power-cotizador-v4.eduardo-dev.workers.dev/ y verificar:
- Botón "Remisión" visible en home
- Formulario funcional con todas las secciones
- Vista previa en tiempo real
- PDF genera correctamente
- Los demás módulos siguen funcionando

---

## Gestión de Riesgos por Fase

| Fase | Riesgo | Prob. | Impacto | Mitigación |
|------|--------|-------|---------|------------|
| 1 | Tipos incorrectos | Baja | Medio | Revisar contra el diseño en hola |
| 3 | Hook no recupera borrador | Media | Medio | Probar recarga del navegador |
| 4 | Layout del formulario desalineado | Media | Bajo | Usar mismo patrón de ContractForm |
| 5 | PDF no renderiza logo | Media | Alto | Ver ruta del asset |
| 5 | Layout del PDF incorrecto | Media | Alto | Usar Flexbox, probar con datos reales |
| 6 | Conflicto en App.tsx | Baja | Alto | No modificar código existente, solo agregar |
| 7 | Build falla | Baja | Alto | Corregir errores de compilación |

---

## Gestión de Supuestos

| Supuesto | Descripción | Justificación | Validación |
|----------|-------------|---------------|------------|
| S01 | Logo existe en `src/assets/logo.jpeg` | Verificado en el filesystem | Confirmado |
| S02 | @react-pdf/renderer puede cargar logo local | Usa Image con src relativa | Probar build |
| S03 | Numeración R-001 es independiente | Nueva clave en localStorage | Confirmado |

---

## Criterios de Éxito

- [ ] `npm run build` exitoso
- [ ] `npm run lint` sin errores
- [ ] Formulario renderiza todos los campos especificados
- [ ] Vista previa se actualiza en tiempo real
- [ ] Detalle de entrega dinámico (agregar/eliminar)
- [ ] Selección múltiple funcional
- [ ] PDF contiene: header, cliente, logística, detalle, firmas
- [ ] PDF se descarga con nombre de archivo correcto
- [ ] Borrador se guarda y recupera correctamente
- [ ] Módulo responsive (2 columnas ≥1024px, 1 columna <1024px)
- [ ] Los módulos existentes siguen funcionando
- [ ] Cambios publicados en GitHub y desplegados en Cloudflare

---

## Comandos de Verificación

```bash
npm run build
npm run lint
npm run test
```
