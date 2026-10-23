import { supabase } from '../lib/supabase'

export const MEMORY_PHOTOS_BUCKET = 'memory-photos'
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const SIGNED_URL_TTL_SECONDS = 10 * 60
const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const photoPathPattern = /^shared\/[0-9a-f-]+\.(jpg|jpeg|png|webp)$/

function getClient() {
  if (!supabase) throw new Error('Supabase todavía no está configurado.')
  return supabase
}

export function validateImageFile(file: File) {
  if (!supportedImageTypes.has(file.type)) throw new Error('Elige una imagen JPG, PNG o WebP.')
  if (file.size === 0) throw new Error('La imagen está vacía. Prueba con otro archivo.')
  if (file.size > MAX_IMAGE_SIZE_BYTES) throw new Error('La imagen supera el límite de 5 MB.')
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(imageUrl); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(imageUrl); reject(new Error('No pudimos leer esa imagen.')) }
    image.src = imageUrl
  })
}

async function canvasToWebp(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No pudimos optimizar la imagen.')), 'image/webp', 0.86)
  })
}

export async function optimizeImage(file: File): Promise<File> {
  validateImageFile(file)
  const image = await loadImage(file)
  const longestSide = 2048
  const scale = Math.min(1, longestSide / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Tu navegador no pudo preparar la imagen.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const optimized = await canvasToWebp(canvas)
  if (optimized.size > MAX_IMAGE_SIZE_BYTES) throw new Error('La imagen optimizada aún supera el límite de 5 MB.')
  return new File([optimized], 'memory.webp', { type: 'image/webp' })
}

export async function uploadMemoryPhoto(file: File) {
  const client = getClient()
  const image = await optimizeImage(file)
  const path = `shared/${crypto.randomUUID()}.webp`
  const { error } = await client.storage.from(MEMORY_PHOTOS_BUCKET).upload(path, image, {
    cacheControl: '3600', contentType: image.type, upsert: false,
  })
  if (error) throw new Error('No pudimos subir la foto. Revisa tu conexión y permisos.')
  return path
}

export async function getSignedMemoryPhotoUrl(path: string) {
  if (!photoPathPattern.test(path)) return undefined
  const client = getClient()
  const { data, error } = await client.storage.from(MEMORY_PHOTOS_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error) throw new Error('No pudimos preparar una vista privada de la foto.')
  return data.signedUrl
}

export async function deleteMemoryPhoto(path: string) {
  if (!photoPathPattern.test(path)) throw new Error('La ruta de la foto no es válida.')
  const client = getClient()
  const { error } = await client.storage.from(MEMORY_PHOTOS_BUCKET).remove([path])
  if (error) throw new Error('No pudimos eliminar la foto privada.')
}
