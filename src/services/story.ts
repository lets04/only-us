import { defaultStory } from '../data/story'
import { supabase } from '../lib/supabase'
import type { StorySettings } from '../types/models'

type StoryRow = {
  title: string
  subtitle: string
  intro_text: string
  relationship_start_date: string
}

function getClient() {
  if (!supabase) throw new Error('Supabase todavía no está configurado.')
  return supabase
}

function fromRow(row: StoryRow): StorySettings {
  return {
    title: row.title,
    subtitle: row.subtitle,
    introText: row.intro_text,
    relationshipStartDate: row.relationship_start_date,
  }
}

export async function getStorySettings(): Promise<StorySettings> {
  const { data, error } = await getClient()
    .from('story_settings')
    .select('title,subtitle,intro_text,relationship_start_date')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw new Error('No pudimos cargar nuestra historia. Revisa tu sesión y permisos.')
  if (!data) return defaultStory
  return fromRow(data as StoryRow)
}

export async function updateStorySettings(settings: StorySettings) {
  const client = getClient()
  const title = settings.title.trim()
  const subtitle = settings.subtitle.trim()
  const introText = settings.introText.trim()
  if (!title) throw new Error('Agrega un título para nuestra historia.')
  if (!subtitle) throw new Error('Agrega un subtítulo para nuestra historia.')
  if (!introText) throw new Error('Escribe la introducción para guardarla.')
  if (!settings.relationshipStartDate) throw new Error('Elige la fecha en la que nos hicimos novios.')

  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError || !userData.user) throw new Error('Tu sesión venció. Inicia sesión de nuevo.')

  const { error } = await client.from('story_settings').update({
    title,
    subtitle,
    intro_text: introText,
    relationship_start_date: settings.relationshipStartDate,
    updated_by: userData.user.id,
  }).eq('id', 1)
  if (error) throw new Error('No pudimos guardar la historia. Revisa tus permisos e inténtalo de nuevo.')
}
