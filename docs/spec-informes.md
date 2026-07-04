# Especificación — Módulo de Informes Técnicos

> Basado en el análisis del informe técnico real (AVICOLA LOS CAMBULOS, 04 julio 2026)
> Documento de referencia: `docs/REPORT-ARCHITECTURE.md`

## Inventario de campos

### Encabezado — Datos de la empresa (fijos, reutilizados del módulo de cotizaciones)

| Campo | Tipo | Notas |
|---|---|---|
| Logo | Fijo (asset) | Mismo logo del módulo de cotizaciones |
| Nombre empresa | Fijo (constante) | NEW POWER ENERGY SAS |
| NIT empresa | Fijo (constante) | 901826285-6 |
| Dirección | Fijo (constante) | VILLAVICENCIO-META |
| Teléfono | Fijo (constante) | (57) 3204931541 |

### Encabezado — Datos del informe

| Campo | Tipo | Notas |
|---|---|---|
| Número de informe | Dinámico, autogenerado | Formato "IT-001", correlativo |
| Título | Fijo | "INFORME TÉCNICO" — no editable en esta versión |
| Fecha | Dinámico, obligatorio | Por defecto hoy, editable |

### Datos del servicio

| Campo | Tipo | Notas |
|---|---|---|
| Cliente | Dinámico, obligatorio | Texto libre |
| NIT del cliente | Dinámico, opcional | No obligatorio |

### Cuerpo del informe

| Campo | Tipo | Notas |
|---|---|---|
| Observaciones | Dinámico, obligatorio | Texto libre multilínea |

### Registro fotográfico

| Campo | Tipo | Notas |
|---|---|---|
| Grupo de fotos | Dinámico | Arreglo de grupos, sin límite |
| Nombre del grupo | Dinámico, obligatorio por grupo | Ej: "Garza", "Morichal 1" |
| Fotos dentro del grupo | Dinámico, mínimo 1 por grupo | Sin límite fijo; avisar si >20 |
| Descripción por foto | No incluido | No se implementa en esta versión |

### Cierre

| Campo | Tipo | Notas |
|---|---|---|
| Técnico responsable | Dinámico, obligatorio | Nombre de la persona |

## Comportamiento por bloque

### Encabezado (branding)
- Estático en toda la app, no forma parte del formulario.
- Se reutiliza exactamente la misma configuración del módulo de cotizaciones.

### Número de informe
- Se autogenera en formato `IT-{correlativo}` (ej. IT-001, IT-002).
- El correlativo se guarda en localStorage.
- Se puede editar manualmente si es necesario corregirlo.
- La numeración es independiente de la numeración de cotizaciones.

### Datos del servicio
- Fecha: autocompletada con el día actual, editable por el usuario.
- Cliente: campo obligatorio, texto libre.
- NIT: campo opcional.

### Observaciones
- Texto libre multilínea.
- Cuerpo principal del informe donde se describe el trabajo realizado.

### Grupos de fotos
- Lista dinámica de grupos.
- Cada grupo tiene: nombre del sitio/ubicación + conjunto de fotos.
- El usuario puede agregar y eliminar grupos.
- Los grupos se pueden reordenar (arrastrar o botones subir/bajar).
- Se debe mostrar una advertencia si un grupo supera las 20 fotos.

### Fotos dentro de un grupo
- Carga desde: selector de archivos, arrastrar y soltar, o cámara del dispositivo.
- Varias fotos se pueden cargar en una sola operación.
- Cada foto se puede eliminar individualmente (con opción de "deshacer" breve).
- Las fotos se pueden reordenar dentro del grupo.
- Normalización automática: ajuste de tamaño, corrección de orientación, cuadrícula uniforme.

### Técnico responsable
- Campo obligatorio.
- Se muestra al final del documento.

## Mejoras de UX detectadas

| Mejora | Estado |
|---|---|
| Tipografía unificada (una sola familia profesional) | **MVP** |
| Cuadrícula de fotos uniforme (celdas de igual tamaño) | **MVP** |
| Jerarquía visual más clara (títulos, espaciado, tarjetas) | **MVP** |
| Número de informe autogenerado (IT-001) | **MVP** |
| Aviso al superar 20 fotos en un grupo | **MVP** |
| Firma digital (trazo capturado en pantalla táctil) | Mejora futura |

## Decisiones de negocio (confirmadas)

| Decisión | Valor |
|---|---|
| Número de informe | Incluir, formato "IT-001" |
| Límite de fotos por grupo | Sin límite fijo, avisar si >20 |
| Título editable | No, queda fijo "INFORME TÉCNICO" |
| NIT del cliente | Opcional |
| Pies de foto por imagen | No se incluyen en esta versión |

## Preguntas abiertas (pendientes de confirmar con el cliente)

*(Sin preguntas abiertas adicionales en este momento — todas las decisiones del Anexo A fueron resueltas)*

## Modelo de datos (TypeScript)

```typescript
export interface Foto {
  id: string
  src: string  // base64 data URL
}

export interface GrupoFotos {
  id: string
  nombre: string
  fotos: Foto[]
}

export interface InformeTecnico {
  numero: string       // "IT-001"
  titulo: string       // "INFORME TÉCNICO" (fijo)
  fecha: string        // ISO date (yyyy-mm-dd)
  cliente: string
  nit: string          // opcional
  observaciones: string
  grupos: GrupoFotos[]
  tecnico: string
}
```
