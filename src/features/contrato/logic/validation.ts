import { z } from 'zod/v3'

export const especificacionItemSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  valor: z.string(),
})

export const clausulaItemSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1, 'El título es obligatorio'),
  texto: z.string(),
})

export const grupoEspecificacionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  items: z.array(especificacionItemSchema),
})

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
  grupos: z.array(grupoEspecificacionSchema),
  clausulas: z.array(clausulaItemSchema),
  economico: z.object({
    valorTotal: z.coerce.number().nonnegative().default(65000000),
    pagoInicial: z.coerce.number().nonnegative().default(45000000),
    saldo: z.coerce.number().nonnegative().default(20000000),
    fechaLimite: z.string().optional().default(''),
  }),
  observaciones: z.string().optional().default(''),
})

export type ContratoFormData = z.infer<typeof contratoSchema>
