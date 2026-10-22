import { API_BASE_URL } from '@/api/http'

/**
 * Public API dagi `photoUrl` ("/api/v1/public/<slug>/photos/<id>") ni brauzer manziliga aylantiradi.
 * VITE_API_BASE_URL boshqa originni ko'rsatsa ("https://api.example.uz/api/v1"), rasm ham shu yerdan olinadi.
 */
export function resolvePhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^(https?:|blob:|data:)/i.test(path)) return path
  return API_BASE_URL.replace(/\/$/, '') + path.replace(/^\/api\/v1/, '')
}
