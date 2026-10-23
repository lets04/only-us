const spotifyUrlPattern =
  /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album)\/([A-Za-z0-9]+)(?:\?.*)?$/

export type SpotifyLink = {
  type: 'track' | 'album'
  id: string
  url: string
}

export function parseSpotifyUrl(raw: string): SpotifyLink {
  const url = raw.trim()
  if (!url) throw new Error('Pega un enlace de Spotify para guardar la canción.')
  if (/^(javascript|data|file|http):/i.test(url)) {
    throw new Error('Usa un enlace seguro de Spotify, con https.')
  }
  const match = url.match(spotifyUrlPattern)
  if (!match || (match[1] !== 'track' && match[1] !== 'album')) {
    throw new Error('El enlace tiene que ser de una canción o un álbum de Spotify.')
  }
  return {
    type: match[1],
    id: match[2],
    url: `https://open.spotify.com/${match[1]}/${match[2]}`,
  }
}

export function getSpotifyEmbedSrc(link: SpotifyLink) {
  return `https://open.spotify.com/embed/${link.type}/${link.id}?utm_source=generator&theme=0`
}

export function getSpotifyEmbedHeight(type: SpotifyLink['type']) {
  return type === 'album' ? 352 : 152
}
