import { FIRST_STORY_MEMORY_ID, firstStoryMemory } from '../data/story'
import { supabase } from '../lib/supabase'
import type { Memory, MemoryDraft } from '../types/models'
import { deleteMemoryPhoto, getSignedMemoryPhotoUrl, uploadMemoryPhoto } from './photos'

type MemoryRow = {
  id: string
  title: string
  memory_date: string
  description: string
  created_by: string
  photo_path: string | null
  sort_order: number
  is_visible: boolean
  show_in_carousel: boolean
  show_in_story: boolean
}

function getClient() {
  if (!supabase) throw new Error('Supabase todavía no está configurado.')
  return supabase
}

async function requireCurrentUser() {
  const { data, error } = await getClient().auth.getUser()
  if (error || !data.user) throw new Error('Tu sesión venció. Inicia sesión de nuevo.')
  return data.user
}

function validateMemoryDraft(memory: MemoryDraft) {
  if (!memory.title.trim()) throw new Error('Agrega un título para guardar el recuerdo.')
  if (!memory.date) throw new Error('Elige una fecha para guardar el recuerdo.')
  if (!memory.description.trim()) throw new Error('Agrega una descripción para guardar el recuerdo.')
}

async function fromRow(row: MemoryRow): Promise<Memory> {
  let imageUrl: string | undefined
  if (row.photo_path) {
    try { imageUrl = await getSignedMemoryPhotoUrl(row.photo_path) }
    catch { imageUrl = undefined }
  }
  return {
    id: row.id,
    title: row.title,
    date: row.memory_date,
    description: row.description,
    createdBy: row.created_by,
    photoPath: row.photo_path ?? undefined,
    imageUrl,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    showInCarousel: row.show_in_carousel,
    showInStory: row.show_in_story,
  }
}

const memoryColumns = 'id,title,memory_date,description,created_by,photo_path,sort_order,is_visible,show_in_carousel,show_in_story'

export async function getMemories(): Promise<Memory[]> {
  const { data, error } = await getClient()
    .from('memories')
    .select(memoryColumns)
    .order('sort_order', { ascending: true })
    .order('memory_date', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error('No pudimos cargar los recuerdos. Revisa tu sesión y permisos.')
  return Promise.all((data as MemoryRow[]).map(fromRow))
}

async function nextSortOrder() {
  const { data, error } = await getClient()
    .from('memories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return 1
  return ((data as { sort_order: number } | null)?.sort_order ?? 0) + 1
}

function toInsertPayload(memory: MemoryDraft, userId: string, photoPath?: string, id?: string) {
  return {
    ...(id ? { id } : {}),
    title: memory.title.trim(),
    memory_date: memory.date,
    description: memory.description.trim(),
    photo_path: photoPath ?? null,
    created_by: userId,
    sort_order: memory.sortOrder ?? 0,
    is_visible: memory.isVisible ?? true,
    show_in_carousel: memory.showInCarousel ?? false,
    show_in_story: memory.showInStory ?? false,
  }
}

export async function createMemory(memory: MemoryDraft, photo?: File) {
  const client = getClient()
  const user = await requireCurrentUser()
  validateMemoryDraft(memory)
  let photoPath: string | undefined
  try {
    if (photo) photoPath = await uploadMemoryPhoto(photo)
    const sortOrder = memory.sortOrder ?? await nextSortOrder()
    const { error } = await client.from('memories').insert(
      toInsertPayload({ ...memory, sortOrder }, user.id, photoPath),
    )
    if (error) throw new Error('No pudimos guardar el recuerdo. Revisa los datos y tus permisos.')
  } catch (error) {
    if (photoPath) await deleteMemoryPhoto(photoPath).catch(() => undefined)
    throw error
  }
}

export async function updateMemory(memory: Memory, draft: MemoryDraft, photo?: File) {
  const client = getClient()
  await requireCurrentUser()
  validateMemoryDraft(draft)
  let uploaded: string | undefined
  try {
    if (photo) uploaded = await uploadMemoryPhoto(photo)
    const nextPath = uploaded ?? memory.photoPath ?? null
    const { error } = await client.from('memories').update({
      title: draft.title.trim(),
      memory_date: draft.date,
      description: draft.description.trim(),
      photo_path: nextPath,
      sort_order: draft.sortOrder ?? memory.sortOrder,
      is_visible: draft.isVisible ?? memory.isVisible,
      show_in_carousel: draft.showInCarousel ?? memory.showInCarousel,
      show_in_story: draft.showInStory ?? memory.showInStory,
    }).eq('id', memory.id)
    if (error) throw new Error('No pudimos guardar los cambios. Revisa tus permisos e inténtalo de nuevo.')
    if (uploaded && memory.photoPath && memory.photoPath !== uploaded) {
      await deleteMemoryPhoto(memory.photoPath).catch(() => undefined)
    }
  } catch (error) {
    if (uploaded) await deleteMemoryPhoto(uploaded).catch(() => undefined)
    throw error
  }
}

export async function ensureFirstStoryMemory() {
  const client = getClient()
  const user = await requireCurrentUser()
  const { data, error } = await client
    .from('memories')
    .select('id')
    .eq('id', FIRST_STORY_MEMORY_ID)
    .maybeSingle()
  if (error) throw new Error('No pudimos preparar el primer recuerdo de nuestra historia.')
  if (data) return
  const { error: insertError } = await client.from('memories').insert(
    toInsertPayload({
      ...firstStoryMemory,
      showInStory: true,
      isVisible: true,
      showInCarousel: false,
      sortOrder: 1,
    }, user.id, undefined, FIRST_STORY_MEMORY_ID),
  )
  if (insertError && insertError.code !== '23505') {
    throw new Error('No pudimos crear el primer recuerdo de nuestra historia.')
  }
}

export async function deleteMemory(memory: Memory) {
  if (memory.id === FIRST_STORY_MEMORY_ID) {
    throw new Error('Este primer recuerdo se queda en nuestra historia. Puedes editarlo u ocultarlo.')
  }
  const client = getClient()
  await requireCurrentUser()
  const { error } = await client.from('memories').delete().eq('id', memory.id)
  if (error) throw new Error('No pudimos eliminar el recuerdo. Revisa tus permisos e inténtalo de nuevo.')
  if (memory.photoPath) {
    try { await deleteMemoryPhoto(memory.photoPath) }
    catch { return { cleanupWarning: 'El recuerdo se eliminó, pero revisa Storage por si quedó una foto pendiente.' } }
  }
  return { cleanupWarning: undefined }
}
