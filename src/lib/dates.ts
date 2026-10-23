export const DEFAULT_ANNIVERSARY = '2025-06-23'

export function parseLocalDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

export function formatLongDate(value: string) {
  return parseLocalDate(value).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(value: string) {
  return parseLocalDate(value).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
  })
}

export function getAnniversaryDuration(startDate = DEFAULT_ANNIVERSARY) {
  const anniversaryDate = parseLocalDate(startDate)
  const now = new Date()
  let months = (now.getFullYear() - anniversaryDate.getFullYear()) * 12 + now.getMonth() - anniversaryDate.getMonth()
  if (now.getDate() < anniversaryDate.getDate()) months -= 1
  const anchor = new Date(anniversaryDate)
  anchor.setMonth(anchor.getMonth() + months)
  const days = Math.max(0, Math.floor((now.getTime() - anchor.getTime()) / 86_400_000))
  const totalDays = Math.max(0, Math.floor((now.getTime() - anniversaryDate.getTime()) / 86_400_000))
  return { months: Math.max(0, months), days, totalDays }
}
