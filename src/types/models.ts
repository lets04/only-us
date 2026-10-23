export type Memory = {
  id: string
  title: string
  date: string
  description: string
  imageUrl?: string
  photoPath?: string
  createdBy?: string
  sortOrder: number
  isVisible: boolean
  showInCarousel: boolean
  showInStory: boolean
}

export type MemoryDraft = Pick<Memory, 'title' | 'date' | 'description'> & {
  sortOrder?: number
  isVisible?: boolean
  showInCarousel?: boolean
  showInStory?: boolean
}

export type StorySettings = {
  title: string
  subtitle: string
  introText: string
  relationshipStartDate: string
}

export type Song = {
  id: string
  title: string
  artist: string
  spotifyUrl: string
  dedication: string
  sortOrder: number
}

export type SongDraft = Pick<Song, 'title' | 'artist' | 'spotifyUrl' | 'dedication'>

export type TimelineEntry = Memory & {
  label: string
}

export type GalleryItem = Memory & {
  category: string
}

export type Profile = {
  id: string
  displayName: string
  avatarUrl?: string
}
