const MAX_LONGEST_SIDE = 2000
const JPEG_QUALITY = 0.85

function corregirOrientacion(img: HTMLImageElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    const width = img.naturalWidth
    const height = img.naturalHeight

    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0)

    resolve(canvas)
  })
}

function reducirSiEsNecesario(canvas: HTMLCanvasElement): HTMLCanvasElement {
  let { width, height } = canvas

  if (width > height && width > MAX_LONGEST_SIDE) {
    height = Math.round((height * MAX_LONGEST_SIDE) / width)
    width = MAX_LONGEST_SIDE
  } else if (height > MAX_LONGEST_SIDE) {
    width = Math.round((width * MAX_LONGEST_SIDE) / height)
    height = MAX_LONGEST_SIDE
  }

  if (width !== canvas.width || height !== canvas.height) {
    const resized = document.createElement('canvas')
    resized.width = width
    resized.height = height
    const ctx = resized.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, width, height)
    return resized
  }

  return canvas
}

export function procesarImagen(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        try {
          const orientado = await corregirOrientacion(img)
          const reducido = reducirSiEsNecesario(orientado)
          resolve(reducido.toDataURL('image/jpeg', JPEG_QUALITY))
        } catch {
          resolve(reader.result as string)
        }
      }
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

export function esImagenBajaResolucion(dataUrl: string, umbral = 300000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const pixels = img.naturalWidth * img.naturalHeight
      resolve(pixels < umbral)
    }
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}

export function cargarMultiplesFotos(files: FileList): Promise<string[]> {
  return Promise.all(Array.from(files).map((f) => procesarImagen(f)))
}
