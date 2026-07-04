export interface Foto {
  id: string
  src: string
}

export interface GrupoFotos {
  id: string
  nombre: string
  fotos: Foto[]
}

export interface InformeTecnico {
  numero: string
  titulo: string
  fecha: string
  cliente: string
  nit: string
  observaciones: string
  grupos: GrupoFotos[]
  tecnico: string
}
