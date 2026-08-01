import { getSpotifyConfig } from '@/lib/site-settings'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com'

type CachedToken = {
  accessToken: string
  /** Epoch ms when the token should be treated as expired. */
  expiresAt: number
}

let cachedToken: CachedToken | null = null

async function fetchAccessToken(): Promise<string> {
  const { clientId, clientSecret } = await getSpotifyConfig()
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not configured')
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Spotify token request failed (${res.status})${body ? `: ${body.slice(0, 200)}` : ''}`)
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) {
    throw new Error('Spotify token response missing access_token')
  }

  const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600
  // Refresh 60s early to avoid edge-of-expiry 401s.
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Math.max(30, expiresInSec - 60) * 1000,
  }
  return data.access_token
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken
  }
  return fetchAccessToken()
}

/**
 * Authenticated Spotify Web API fetch. `path` may be absolute under api.spotify.com
 * or a relative path like `/v1/artists/...`. Retries once on 401 after refreshing the token.
 */
export async function spotifyFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

  const doFetch = async (token: string) =>
    fetch(url, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

  let token = await getAccessToken()
  let res = await doFetch(token)

  if (res.status === 401) {
    token = await getAccessToken(true)
    res = await doFetch(token)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Spotify API ${res.status} for ${path}${body ? `: ${body.slice(0, 300)}` : ''}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}
