import { z } from 'zod/v3'

export const fotoSchema = z.object({
  id: z.string(),
  src: z.string().min(1, 'La foto es obligatoria'),
})

export const grupoFotosSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre del grupo es obligatorio'),
  fotos: z.array(fotoSchema).min(1, 'Agrega al menos una foto'),
})

export const informeSchema = z.object({
  numero: z.string(),
  titulo: z.string(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  cliente: z.string().min(1, 'El cliente es obligatorio'),
  nit: z.string().optional(),
  observaciones: z.string().min(1, 'Las observaciones son obligatorias'),
  grupos: z.array(grupoFotosSchema).min(1, 'Agrega al menos un grupo de fotos'),
  tecnico: z.string().min(1, 'El técnico es obligatorio'),
})

export type InformeFormData = z.infer<typeof informeSchema>
