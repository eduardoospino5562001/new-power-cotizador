import { z } from 'zod/v3'

export const detalleItemSchema = z.object({
  id: z.string(),
  cantidad: z.string(),
  codigo: z.string(),
  descripcion: z.string(),
  serial: z.string(),
  observaciones: z.string(),
})

export const firmaSchema = z.object({
  firma: z.string().optional().default(''),
  nombre: z.string(),
  cargo: z.string(),
  documento: z.string(),
  fecha: z.string(),
  hora: z.string(),
})

export const remisionSchema = z.object({
  numero: z.string(),
  fecha: z.string(),
  pedido: z.string(),
  contrato: z.string(),
  cliente: z.object({
    nombre: z.string().min(1, 'El nombre del cliente es obligatorio'),
    ccNit: z.string().min(1, 'El CC/NIT es obligatorio'),
    direccion: z.string().optional().default(''),
    ciudad: z.string().optional().default(''),
    telefono: z.string().optional().default(''),
  }),
  logistica: z.object({
    lugarDespacho: z.string().default('Villavicencio'),
    lugarEntrega: z.string().default('Medellín'),
    responsableTransporte: z.string().optional().default(''),
    vehiculo: z.string().optional().default(''),
    placa: z.string().optional().default(''),
  }),
  detalles: z.array(detalleItemSchema),
  observaciones: z.string().optional().default(''),
  entrega: firmaSchema,
  recibe: firmaSchema,
})

export type RemisionFormData = z.infer<typeof remisionSchema>
