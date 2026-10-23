import { parseSpotifyUrl } from '../lib/spotify'
import { supabase } from '../lib/supabase'
import type { Song, SongDraft } from '../types/models'

type SongRow = {
  id: string
  title: string
  artist: string
  spotify_url: string
  dedication: string
  sort_order: number
}

function getClient() {
  if (!supabase) throw new Error('Supabase todavía no está configurado.')
  return supabase
}

function fromRow(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    spotifyUrl: row.spotify_url,
    dedication: row.dedication,
    sortOrder: row.sort_order,
  }
}

function validateSongDraft(song: SongDraft) {
  if (!song.title.trim()) throw new Error('Agrega el título de la canción.')
  if (!song.artist.trim()) throw new Error('Agrega el nombre del artista.')
  parseSpotifyUrl(song.spotifyUrl)
}

export async function getSongs(): Promise<Song[]> {
  const { data, error } = await getClient()
    .from('songs')
    .select('id,title,artist,spotify_url,dedication,sort_order')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error('No pudimos cargar las canciones. Revisa tu sesión y permisos.')
  return (data as SongRow[]).map(fromRow)
}

export async function createSong(song: SongDraft) {
  const client = getClient()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError || !userData.user) throw new Error('Tu sesión venció. Inicia sesión de nuevo.')
  validateSongDraft(song)
  const link = parseSpotifyUrl(song.spotifyUrl)
  const { data: last } = await client.from('songs').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle()
  const sortOrder = ((last as { sort_order: number } | null)?.sort_order ?? 0) + 1
  const { error } = await client.from('songs').insert({
    title: song.title.trim(),
    artist: song.artist.trim(),
    spotify_url: link.url,
    dedication: song.dedication.trim(),
    sort_order: sortOrder,
    created_by: userData.user.id,
  })
  if (error) throw new Error('No pudimos guardar la canción. Revisa el enlace y tus permisos.')
}

export async function updateSong(id: string, song: SongDraft, sortOrder: number) {
  const client = getClient()
  validateSongDraft(song)
  const link = parseSpotifyUrl(song.spotifyUrl)
  const { error } = await client.from('songs').update({
    title: song.title.trim(),
    artist: song.artist.trim(),
    spotify_url: link.url,
    dedication: song.dedication.trim(),
    sort_order: sortOrder,
  }).eq('id', id)
  if (error) throw new Error('No pudimos actualizar la canción. Revisa tus permisos e inténtalo de nuevo.')
}

export async function deleteSong(id: string) {
  const { error } = await getClient().from('songs').delete().eq('id', id)
  if (error) throw new Error('No pudimos eliminar la canción. Revisa tus permisos e inténtalo de nuevo.')
}
