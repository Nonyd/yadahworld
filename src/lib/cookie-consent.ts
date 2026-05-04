export const COOKIE_CONSENT_STORAGE_KEY = 'yadah_cookie_consent_v1'

/** `essential` — necessary site cookies only; no Vercel Analytics. `analytics` — includes anonymous traffic analytics. */
export type CookieConsentChoice = 'essential' | 'analytics'

export const COOKIE_CONSENT_CHANGE_EVENT = 'yadah:cookie-consent-change'

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (raw === 'essential' || raw === 'analytics') return raw
    return null
  } catch {
    return null
  }
}

export function writeCookieConsent(choice: CookieConsentChoice): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice)
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
  } catch {
    /* storage blocked */
  }
}

export function clearCookieConsent(): void {
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY)
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
  } catch {
    /* storage blocked */
  }
}
