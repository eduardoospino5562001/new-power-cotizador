# New Power Cotizador - Guia para agentes

## Proposito

Aplicacion interna de **NEW POWER ENERGY SAS** para crear y descargar documentos profesionales en el navegador. No tiene backend ni autenticacion. Los datos y borradores permanecen en el navegador del usuario.

Modulos actuales:

- `quote`: cotizaciones con items, impuestos, descuentos y PDF.
- `report`: informes tecnicos con grupos de fotos y PDF.
- `contrato`: contratos de compraventa con clausulas y PDF.
- `remision`: remisiones de entrega y PDF.
- `contabilidad`: conversion de archivos Excel a comprobantes contables y descarga de Excel.
- `history`: biblioteca local de archivos generados y documentos retomables.

## Stack y comandos

- React 19 + TypeScript + Vite.
- Tailwind CSS v4 mediante `@tailwindcss/vite`.
- React Hook Form + Zod para formularios y validacion.
- `@react-pdf/renderer` para PDFs; `exceljs` para archivos Excel.
- Alias `@` apunta a `src/`.
- Despliegue: Cloudflare Pages/Workers; `wrangler.toml` publica `dist/` como SPA.

```bash
npm run dev       # Vite, normalmente http://localhost:5173
npm run test      # Vitest en jsdom
npm run lint      # oxlint
npm run build     # TypeScript + Vite; inserta el SHA git en dist/index.html
```

Antes de modificar codigo, revisa `git status --short`. El repositorio puede contener cambios locales de otros trabajos: no los reviertas ni los incluyas en cambios no relacionados.

## Punto de entrada y navegacion

- `src/main.tsx` registra las fuentes PDF y monta React en `#root` con `StrictMode`.
- `src/App.tsx` es el orquestador y la navegacion. No existe React Router.
- El tipo `Modulo` y el estado `modulo` en `App.tsx` seleccionan la vista actual.
- La pantalla inicial es el Centro de documentos: busca herramientas, muestra hasta cuatro por pagina en escritorio y usa tarjetas desplazables horizontalmente en movil.
- El dashboard usa sidebar en escritorio y navegacion compacta en movil para Centro de documentos e Historial.
- El tema predeterminado es oscuro. La preferencia se persiste en `localStorage` como `npc-theme`; solo el valor `light` activa el modo claro.
- Cotizacion, informe, contrato y remision usan `DocumentWorkspace`, con pestañas independientes de Edicion y Vista previa. Mantiene el estado del formulario al alternar y funciona en cualquier viewport.

Para agregar un modulo nuevo, sigue el patron existente: carpeta en `src/features/<modulo>/`, hook de formulario, tipos, validacion, componentes de formulario/vista previa, generador de archivo si aplica, y una rama explicita en `App.tsx`.

## Estructura relevante

```text
src/
  components/
    layout/                 Header, Footer, PageContainer
    ui/                     controles reutilizables
  features/
    quote/                  cotizaciones y QuotePDF
    report/                 informes, fotos y ReportPDF
    contrato/               contratos y ContractPDF
    remision/               remisiones y RemisionPDF
    contabilidad/           lectura, transformacion y exportacion Excel
    history/                IndexedDB de exportaciones y vista Historial
  assets/                   logo y fuentes
  App.tsx                   seleccion y composicion de modulos
  main.tsx                  bootstrap y registro de fuentes
  worker.ts                 Worker de Cloudflare
docs/                       especificaciones y decisiones historicas
```

Dentro de los modulos documentales, la convencion es:

- `components/`: formularios, previews y filas visuales.
- `hooks/`: estado de React Hook Form y generacion de PDF.
- `logic/`: calculos y esquemas Zod; manten aqui las reglas de negocio puras.
- `lib/`: formato, persistencia y utilidades del navegador.
- `pdf/`: componentes de `@react-pdf/renderer`.
- `types.ts`: modelos del documento final.

## Datos, persistencia y archivos

- Cotizaciones guardan correlativo y borrador en `localStorage` con claves `npc-numero` y `npc-borrador`. El correlativo inicial es 118 y el formato es `C-1-<numero>`.
- Informes guardan el correlativo en `localStorage` (`npr-numero`) y el borrador, incluidas fotos base64, en IndexedDB (`new-power-reports` / `drafts`). El formato es `IT-001`.
- Los otros documentos tambien recuperan borradores desde sus respectivos `lib/storage.ts`; conserva sus formatos y claves al cambiarlos para no perder informacion local existente.
- La generacion de PDF ocurre por hooks `useGenerate*Pdf` y componentes de `pdf/`. No rasterices los PDFs ni reemplaces `@react-pdf/renderer` sin una necesidad concreta.
- Cada PDF y cada preview de cotizacion, informe, contrato y remision incluye la marca de agua discreta del logo. `DocumentWatermark` gobierna el navegador y los componentes `pdf/*PDF.tsx` gobiernan los PDFs.
- Contabilidad trabaja con plantillas de Excel. Los cambios en `excelReader.ts`, `excelExporter.ts` o `excelUtils.ts` deben preservar formatos, formulas y estilos del archivo de origen. Cubre esos casos con pruebas.
- El Historial usa una segunda IndexedDB (`new-power-export-history`, store `exports`) para guardar el Blob descargable, metadatos y, cuando aplica, una copia estructurada editable del documento.
- Los PDFs nuevos de cotizacion, informe, contrato y remision se guardan con `editableData` e `isEditable: true`. Desde Historial, `Continuar editando` restaura el snapshot en el formulario del modulo correspondiente.
- Excel de comprobantes se guarda como archivo descargable y metadatos de generacion, pero no es retomable: el Excel origen no se conserva. No marques un registro como editable si no se puede reconstruir su formulario con datos completos.
- Los registros antiguos o creados antes de la version 2 de la base no contienen snapshot y solo permiten abrir, descargar o eliminar.

## Especificacion funcional actual

Esta seccion describe lo que el codigo implementa hoy. No inventes campos, integraciones, numeraciones o reglas adicionales sin requerimiento explicito.

### 1. Cotizaciones (`src/features/quote`)

**Objetivo:** generar una cotizacion descargable en PDF. No envia la cotizacion por correo, WhatsApp, API ni la guarda en un servidor.

**Datos del documento:**

- Encabezado: numero, fecha y vigencia en dias.
- Descripcion general opcional, ubicada entre el bloque de cliente y los items. Se renderiza tambien en `QuotePreview` y `QuotePDF` antes de la tabla de items.
- Cliente: nombre y NIT obligatorios; ciudad, contacto y telefono opcionales.
- Uno o mas items. Cada item tiene descripcion obligatoria, cantidad mayor que cero, valor unitario no negativo e impuesto entre 0 y 100.
- Descuento global entre 0 y 100.
- Tres notas editables: `revisionInforme`, `retenciones` y `accesorios`.
- Vendedor opcional.

**Valores iniciales y comportamiento:**

- Crea el numero `C-1-<correlativo>`; la semilla local inicial es 118.
- Fecha actual, vigencia de 15 dias, un item vacio con cantidad 1, valor 0 e impuesto 19%, y descuento 0%.
- Las notas traen textos comerciales predefinidos en `useQuoteForm.ts`.
- No permite eliminar el ultimo item.
- Guarda el borrador automaticamente despues de 1.5 s sin cambios en `localStorage`.

**Calculos obligatorios (`logic/calculations.ts`):**

- Bruto de linea = `cantidad * valorUnitario`.
- IVA de linea = `bruto * impuestoPorcentaje / 100`.
- Descuento = `totalBruto * descuentoPorcentaje / 100`.
- Si hay descuento, el IVA se prorratea multiplicando la suma de IVA por `subtotal / totalBruto`.
- Total a pagar = subtotal + IVA. No cambies esta regla sin actualizar pruebas.

**Piezas principales:** `QuoteForm`, `ItemRow`, `TotalsSummary`, `QuotePreview`, `QuotePDF`, `useQuoteForm` y `useGeneratePdf`.

### 2. Informes tecnicos (`src/features/report`)

**Objetivo:** generar un informe tecnico PDF con evidencia fotografica agrupada por sitio. No sincroniza fotos ni informes con un servidor.

**Datos y validacion:**

- Numero, titulo, fecha, cliente, NIT, observaciones, tecnico y grupos de fotos.
- Fecha, cliente, observaciones, tecnico y al menos un grupo son obligatorios.
- El NIT es opcional.
- Cada grupo requiere nombre y al menos una foto. Cada foto solo contiene `id` y `src`.
- El valor inicial del titulo es `INFORME TECNICO`; el numero sigue `IT-001`, `IT-002`, etc.

**Comportamiento de fotos y borrador:**

- Los grupos se pueden agregar, quitar y reordenar mediante `useFieldArray`.
- La carga y normalizacion de imagenes vive en `lib/imageLoader.ts`; `PhotoGroup.tsx` concentra su UI.
- El borrador completo, incluyendo fotos base64, se guarda con debounce de 1.5 s en IndexedDB (`new-power-reports`, store `drafts`, clave `npr-borrador`).
- El correlativo se guarda por separado en `localStorage` con la clave `npr-numero`.
- No migres este borrador a `localStorage`: las fotos pueden superar su cuota de almacenamiento.

**Piezas principales:** `ReportForm`, `PhotoGroup`, `ReportPreview`, `ReportPDF`, `useReportForm` y `useGenerateReportPdf`.

### 3. Contratos de compraventa (`src/features/contrato`)

**Objetivo:** llenar y descargar un contrato de compraventa de una planta electrica. No implementa firma digital, firma manuscrita capturada, aprobacion legal, envio ni persistencia remota.

**Datos:**

- Numero y fecha.
- Vendedor: razon social, NIT, direccion, ciudad, telefono y correo.
- Comprador: nombre y CC/NIT obligatorios; direccion, ciudad, telefono y correo opcionales.
- La estructura admite grupos de especificaciones del equipo; cada grupo contiene pares `nombre`/`valor`. El flujo inicial crea un grupo, pero el esquema actual no exige conservar uno.
- Clausulas editables con titulo obligatorio y texto libre.
- Resumen economico: valor total, pago inicial, saldo y fecha limite.
- Observaciones opcionales.

**Valores por defecto que no se deben tratar como datos dinamicos de una integracion:**

- Vendedor: `NEW POWER ENERGY S.A.S.`, NIT `901.826.285-6`, Villavicencio/Meta y telefono `(57) 3204931541`.
- Un grupo `Equipo 1` con especificaciones prellenadas de una planta Detroit de 500 KVA.
- Doce clausulas predefinidas para la venta de una planta usada.
- Valores economicos iniciales: total 65,000,000; pago inicial 45,000,000; saldo 20,000,000.

**Regla de calculo:** al cambiar valor total o pago inicial, `useContractForm` recalcula el saldo mediante `calcularSaldo`. No conviertas el saldo en un campo independiente sin conservar esta sincronizacion.

**Piezas principales:** `ContractForm`, `ContractPreview`, `ContractPDF`, `useContractForm`, `useGenerateContractPdf`, `logic/calculations.ts` y `logic/validation.ts`.

### 4. Remisiones (`src/features/remision`)

**Objetivo:** generar y descargar una remision de entrega en PDF. Los campos de firma son texto; no hay captura ni validacion criptografica de firmas.

**Datos:**

- Numero, fecha, pedido, contrato y datos de cliente.
- Nombre y CC/NIT del cliente son obligatorios; direccion, ciudad y telefono son opcionales.
- Lista de datos logisticos `nombre`/`valor`.
- Lista de detalles: cantidad, codigo, descripcion, serial y observaciones.
- Observaciones generales.
- Bloques de entrega y recibe, cada uno con firma, nombre, cargo, documento, fecha y hora.

**Valores por defecto:**

- Logistica: despacho en Villavicencio, entrega en Medellin, responsable de transporte, vehiculo y placa.
- Un detalle: cantidad 1, codigo `PL-450`, descripcion `Planta electrica 450 KVA` y observacion `Motor Detroit`.
- Los bloques de entrega y recibe inician vacios.

**Piezas principales:** `RemisionForm`, `RemisionPreview`, `RemisionPDF`, `useRemisionForm`, `useGenerateRemisionPdf` y `logic/validation.ts`.

### 5. Herramientas contables (`src/features/contabilidad`)

**Objetivo:** leer un Excel fuente, filtrar sus filas por proyecto/anio/mes y generar un Excel de comprobantes contables usando la plantilla publica `public/Modelodeimportacion.xlsx`.

**Flujo:**

1. El usuario carga un archivo Excel; se lee solo su primera hoja.
2. Se detectan proyectos y las fechas disponibles, y se seleccionan los primeros valores encontrados.
3. El usuario selecciona proyecto, anio, mes, consecutivo inicial y mapeo de cuentas por medio de pago.
4. Se descarga `comprobante_<proyecto>_<anio>_<mes>.xlsx` y queda disponible un visor del resultado.

**Contrato estricto del Excel fuente:**

- Columna A: lote; F: fecha; G: medio de pago; H: monto; J: comprador; K: etiqueta; O: proyecto.
- Debe existir una columna cuyo encabezado sea una variante normalizada de `Numero de recibo`.
- Las filas sin monto valido se omiten y se cuentan en `skippedMissingAmount`.
- Una fila seleccionada con fecha, lote, medio de pago, comprador o recibo invalido provoca un error; no se exporta parcialmente.
- El recibo y el consecutivo deben ser enteros de hasta 11 digitos.

**Reglas contables implementadas:**

- Cada fila fuente genera exactamente dos filas en `Datos`: un debito y un credito con el mismo consecutivo.
- Debito: tipo 556, moneda COP, cuenta segun el medio de pago y monto en columna V.
- Credito: tipo 556, cuenta 28050501, prefijo `RCBO`, recibo, cuota, fecha de vencimiento y monto en columna W.
- La descripcion es `etiqueta-lote` cuando existe etiqueta; en otro caso es el lote.
- `parseInstallment` interpreta `inicial`, `separacion`, `contado`, `abono` y `abono contado` como cuota 0, y `cuota <n>` como el numero respectivo.
- Medios reconocidos: Davivienda, Bancolombia, efectivo, caja, bonificacion, CTA ARQ y CTA Kathe. Un medio no reconocido se asigna a efectivo.
- Cuentas configurables: efectivo 11050501, Bancolombia 11100504 y Davivienda 11100505. No cambies estos codigos sin una instruccion contable explicita.

**Preservacion de plantilla:**

- `excelExporter.ts` usa ExcelJS para clonar estilos de filas, alturas y estructura de la plantilla.
- La hoja `Datos` es obligatoria; `Hoja1` se actualiza si existe.
- Mantiene fechas sin zona horaria mediante `asExcelDateOnly` y formato de montos `0`.
- No sustituir ExcelJS por `xlsx` en la escritura: se perderian estilos de la plantilla.

**Piezas principales:** `Contabilidad.tsx`, `ComprobantesForm`, `ComprobantesPreview`, `ResultView`, `useComprobantesForm`, `excelReader.ts`, `excelExporter.ts` y `excelUtils.ts`.

## Limites confirmados del producto

- No hay API propia, base de datos, usuarios, roles, autenticacion, pagos, correo, WhatsApp ni sincronizacion entre dispositivos.
- Los PDFs y Excel se generan y descargan en el cliente; los nuevos archivos tambien se archivan localmente en el Historial de ese navegador. No se envian automaticamente ni se sincronizan entre dispositivos.
- Los correlativos son locales al navegador y dispositivo. No garantizan unicidad entre usuarios o equipos.
- Las firmas de contrato y remision son datos de texto; no son firmas electronicas ni digitales.
- La navegacion actual no persiste URLs ni admite enlaces directos a modulos.

## Reglas de trabajo

- Mantener los modulos aislados: no mezclar tipos, validaciones ni estado de un documento con otro.
- Preferir funciones puras y pruebas unitarias para calculos, validaciones y transformaciones de Excel.
- Mantener la vista previa alineada con la estructura del PDF generado.
- Preservar el diseno existente: Tailwind, componentes en `src/components/ui`, y responsive de una columna en movil.
- Los documentos en `docs/` explican decisiones y requisitos, pero algunos describen una etapa anterior. Para el comportamiento actual, prioriza el codigo y `package.json`.
- No se debe asumir persistencia en servidor: una limpieza de datos del navegador elimina los borradores locales.

## Verificacion

1. Ejecuta `npm run test` para cualquier cambio de logica, calculos, Excel o persistencia.
2. Ejecuta `npm run build` cuando afectes imports, tipos, componentes o configuracion.
3. Prueba manualmente el flujo afectado: formulario -> vista previa -> descarga de PDF/Excel.
4. Para informes, verifica tambien la carga, orden y visualizacion de fotos en movil y escritorio.

## Documentacion existente

- `README.md`: resumen funcional y comandos.
- `docs/ARCHITECTURE.md`: arquitectura original del cotizador.
- `docs/REPORT-ARCHITECTURE.md`: requisitos y decisiones del modulo de informes.
- `docs/spec-campos.md` y `docs/spec-informes.md`: campos de documentos.
- `docs/ADR.md`: decisiones tecnologicas originales.
