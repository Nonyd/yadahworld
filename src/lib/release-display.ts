import { formatReleaseDateDisplay } from '@/lib/release-date'

/** `TYPE · 20 Aug 2024` — falls back to catalogue year if date missing. */
export function releaseTypeDateLine(release: { type: string; releasedAt: string; year: string }): string {
  const date = formatReleaseDateDisplay(release.releasedAt)
  return `${release.type} · ${date || release.year}`
}

/** `20 Aug 2024 · Album` — detail column under title. */
export function releaseDateThenType(release: { type: string; releasedAt: string; year: string }): string {
  const date = formatReleaseDateDisplay(release.releasedAt)
  return `${date || release.year} · ${release.type}`
}

/** `ALBUM · 20 Aug 2024` — eyebrow area on detail page. */
export function releaseTypeUpperThenDate(
  typeUpper: string,
  release: { releasedAt: string; year: string },
): string {
  const date = formatReleaseDateDisplay(release.releasedAt)
  return `${typeUpper} · ${date || release.year}`
}
