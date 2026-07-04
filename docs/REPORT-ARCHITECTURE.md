# Informe Técnico de Planificación — Módulo: Informes Técnicos con Registro Fotográfico

> New Power Energy SAS
> Tipo de documento: Análisis y arquitectura funcional (sin código, sin desarrollo)
> Entrada analizada: Informe técnico real de la empresa — cliente AVICOLA LOS CAMBULOS, 04 julio 2026

## 0. Resumen ejecutivo

Este documento planifica un segundo módulo para la aplicación de cotizaciones ya diseñada: un generador de informes técnicos con registro fotográfico. La meta es que ambos módulos —cotizaciones e informes— convivan en una misma aplicación, compartiendo el mismo sistema de diseño (colores de marca, tipografía, componentes), pero con formularios y lógica completamente independientes, de forma que trabajar en uno nunca ponga en riesgo al otro.

El informe de referencia analizado muestra un patrón claro: encabezado de empresa fijo, datos del servicio (fecha/cliente/NIT), un bloque de observaciones en texto libre, y varios grupos de fotografías con nombre propio (en el ejemplo: "Garza", "Garza 2", "Morichal 1", "Orquideas" — nombres de las plantas/sitios visitados), cerrando con el nombre del técnico responsable. Ese patrón de "grupos de fotos con nombre" es la pieza central de diseño de este módulo.

## 1. Análisis del informe técnico actual

### 1.1 Estructura identificada (en orden)

1. **Encabezado de empresa** — logo, nombre, NIT, dirección, teléfono.
2. **Número de informe** — ID único auto-generado (formato "IT-001").
3. **Barra de título** — "INFORME TÉCNICO" (fijo).
4. **Tabla de datos del servicio** — Fecha, Cliente, NIT.
4. **Bloque "Observaciones"** — texto libre describiendo el trabajo realizado.
5. **Uno o más bloques "Registro fotográfico [nombre del sitio]"** — cada uno con su propio título y un número variable de fotos.
6. **Firma / cierre** — "TÉCNICO." + nombre de la persona responsable.

### 1.2 Inventario de campos

| Campo / bloque | Tipo | Notas |
|---|---|---|
| Logo, nombre, NIT, dirección y teléfono de la empresa | **Fijo (constante)** | Reutilizar exactamente la misma configuración de empresa del módulo de cotizaciones |
| Título "INFORME TÉCNICO" | **Fijo** | No editable en esta versión |
| Fecha | **Dinámico, obligatorio** | Por defecto el día actual, editable |
| Cliente | **Dinámico, obligatorio** | Texto libre |
| NIT del cliente | **Dinámico** | Obligatoriedad por confirmar (ver Anexo A) |
| Observaciones | **Dinámico, obligatorio** | Texto libre, multilínea; cuerpo del informe |
| Nombre del grupo de fotos | **Dinámico, obligatorio por grupo** | Tantos grupos como sitios visitados |
| Fotografías dentro de cada grupo | **Dinámico, mínimo 1 foto por grupo** | Cantidad variable, sin límite fijo |
| Nombre del técnico responsable | **Dinámico, obligatorio** | |

### 1.3 Qué debe conservarse sí o sí

- El orden lógico del documento: identificación → observaciones → evidencia fotográfica → responsable.
- La agrupación de fotos por sitio/ubicación, con su propio título.
- Los datos de encabezado de empresa (idénticos a los del módulo de cotizaciones).
- El carácter de "documento de una sola cara de trabajo".

### 1.4 Inconsistencias detectadas (a corregir)

- **Tipografía mixta**: cuerpo usa fuente estándar, firma del técnico en fuente manuscrita/cursiva distinta.
- **Grilla de fotos irregular**: grupos muestran a veces 2 fotos por fila, a veces 3, a veces 1 sola foto.
- **Ausencia de numeración o identificador del informe**.
- **Sin numeración de página**.
- **Campo "NIT" presente pero casi nunca completado**.

## 2. Investigación de referencia y mejoras propuestas

### 2.1 Mejoras propuestas

| Mejora | Descripción | Prioridad |
|---|---|---|
| **Tipografía unificada** | Una sola familia tipográfica profesional en todo el documento, incluida la firma | **MVP** |
| **Cuadrícula de fotos uniforme** | Todas las fotos de un grupo se muestran en celdas de igual tamaño y proporción | **MVP** |
| **Jerarquía visual más clara** | Títulos de sección con más peso visual, espaciado entre bloques, tabla con estilo de tarjeta | **MVP** |
| **NIT del cliente: ¿obligatorio u opcional?** | Pendiente de confirmación (Anexo A) | **Pendiente** |
| **Encabezado de informe con identificador** | Número/código de informe independiente de cotizaciones | **Mejora sugerida (backlog)** |
| **Número de informe autogenerado** | ID único formato "IT-001" | **MVP** |
| **Descripción corta opcional por foto** | Pie de foto breve dentro de cada grupo | **Mejora sugerida (backlog)** |
| **Firma digital real (trazo o imagen)** | Firma capturada en pantalla táctil | **Mejora futura** |

## 3. Objetivo del módulo y flujo completo del usuario

### 3.1 Objetivo

Permitir que un técnico (desde el celular, en campo) o un administrativo (desde el computador) genere un informe técnico profesional con evidencia fotográfica organizada, con la misma rapidez y calidad visual que el módulo de cotizaciones, y lo descargue como PDF listo para enviar al cliente.

### 3.2 Flujo completo paso a paso

1. El usuario entra a la aplicación y elige "Nuevo informe técnico" (junto a "Nueva cotización").
2. El sistema asigna automáticamente el siguiente número de informe (formato "IT-001").
3. Completa los datos del servicio: fecha (hoy por defecto, editable), cliente (obligatorio), NIT (opcional).
4. Escribe las observaciones.
4. Crea uno o más grupos de fotos: por cada sitio/ubicación visitada, le pone un nombre al grupo y sube las fotos correspondientes.
5. Dentro de cada grupo puede: agregar más fotos, eliminar una foto, y reordenarlas.
6. Repite el paso 4 tantas veces como sitios haya visitado.
7. Escribe el nombre del técnico responsable.
8. Revisa la vista previa en tiempo real.
9. Pulsa "Generar PDF".
10. El PDF se descarga automáticamente con nombre identificable (cliente + fecha).

## 4. Diseño de interfaz

### 4.1 Identidad visual

El módulo de informes reutiliza exactamente el sistema de diseño del cotizador: mismos colores de marca (naranja/gris oscuro del logo), misma tipografía, mismos componentes de formulario.

### 4.2 Distribución de pantalla

- **Escritorio**: mismo patrón de dos columnas — formulario a la izquierda, vista previa del informe a la derecha (sticky).
- **Celular**: mismo patrón de pestañas "Editar" / "Vista previa", con botón "Generar PDF" siempre accesible.
- **Sección de grupos de fotos**: cada grupo como tarjeta colapsable con nombre editable y cuadrícula de fotos debajo; botón "+ Agregar grupo de fotos".

## 5. Gestión de fotografías

### 5.1 Formas de cargar imágenes

- **Desde computador**: selector de archivos tradicional, drag & drop.
- **Desde celular**: activar directamente la cámara del dispositivo.
- Varias imágenes en una sola operación al grupo activo.

### 5.2 Organización dentro de un grupo

- **Eliminar**: control visible, con opción de "deshacer".
- **Reordenar**: arrastrar en computador, botones de mover en celular.
- **Renombrar grupo**: campo de texto editable.

### 5.3 Normalización automática

- Fotos grandes se reducen automáticamente.
- Orientación incorrecta corregida automáticamente.
- Proporciones distintas: cuadrícula de celdas de proporción fija con recorte para llenar.
- Fotos de baja resolución: se muestran igual encajadas; aviso opcional al usuario.

### 5.4 Resultado esperado

Cuadrícula prolija, misma proporción entre celdas, agrupada por sitio con títulos claros.

## 6. Exportación

### 6.1 Alcance primera versión

Exportación a PDF como único formato, con calidad visual profesional.

### 6.2 Arquitectura pensada para crecer

Separar datos del informe (independientes de presentación) de la conversión a archivo descargable (pieza intercambiable).

### 6.3 Nombre del archivo

Automático: cliente + fecha.

### 6.4 Numeración de páginas

"Página X de Y" en el pie de cada página, incluso en informes de una sola página.

## 7. Experiencia de usuario

- Rapidez ante todo: campos obligatorios mínimos (fecha, cliente, observaciones, al menos un grupo con una foto).
- Cero pasos perdidos entre cámara y documento.
- Vista previa siempre visible o a un toque de distancia.
- Tolerancia a errores de carga.
- Consistencia con el módulo de cotizaciones.

## 8. Arquitectura de integración con la aplicación existente

### 8.1 Principio rector

El módulo de informes se agrega **al lado** del módulo de cotizaciones, nunca dentro de él ni modificando su funcionamiento.

### 8.2 Qué se comparte

- Sistema de diseño (colores, tipografía, componentes visuales base).
- Datos fijos de la empresa (logo, nombre, NIT, dirección, teléfono).
- Patrón general de pantalla (dos columnas / pestañas).
- Tecnología de generación de PDF.
- Punto de entrada común.

### 8.3 Qué se mantiene separado

- Formulario y sus datos.
- Almacenamiento de borradores (maneja fotografías, más robusto).
- Componente que arma el documento final (plantilla propia).

## Anexo A — Decisiones confirmadas

| # | Pregunta | Decisión |
|---|---|---|
| 1 | ¿Código/número de informe? | **Sí, incluir (ej. "IT-001")** |
| 2 | ¿Límite de fotos/grupos? | **Sin límite fijo, pero avisar si se suben más de 20 en un grupo** |
| 3 | ¿Título editable? | **No, queda fijo "INFORME TÉCNICO" por ahora** |
| 4 | ¿NIT obligatorio? | **Opcional** |
| 5 | ¿Pies de foto? | **No, no se incluyen en esta versión** |

## Anexo B — Qué sigue

Este documento cierra la etapa de planificación funcional y de diseño. El siguiente paso es el desglose de tareas para el agente de programación.
