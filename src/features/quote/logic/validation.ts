import { z } from 'zod/v3'

const nitRegex = /^\d+-?\d*$/

export const itemSchema = z.object({
  id: z.string(),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  cantidad: z.coerce.number().positive('Debe ser mayor a 0'),
  valorUnitario: z.coerce.number().nonnegative('Debe ser 0 o mayor'),
  impuestoPorcentaje: z.coerce.number().min(0).max(100),
})

export const cotizacionSchema = z.object({
  numero: z.string(),
  fecha: z.string(),
  validezDias: z.coerce.number().positive(),
  descripcion: z.string().optional().default(''),
  cliente: z.object({
    nombre: z.string().min(1, 'El nombre del cliente es obligatorio'),
    nit: z.string()
      .min(1, 'El NIT es obligatorio')
      .regex(nitRegex, 'Formato de NIT inválido'),
    ciudad: z.string().optional(),
    contacto: z.string().optional(),
    telefono: z.string().optional(),
  }),
  items: z.array(itemSchema).min(1, 'Agrega al menos un ítem'),
  descuentoPorcentaje: z.coerce.number().min(0).max(100).default(0),
  notas: z.object({
    revisionInforme: z.string(),
    retenciones: z.string(),
    accesorios: z.string(),
  }),
  vendedor: z.string().optional(),
})

export type CotizacionFormData = z.infer<typeof cotizacionSchema>
