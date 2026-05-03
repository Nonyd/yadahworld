import type { ReactNode } from 'react'

function iconWrap(children: ReactNode, className: string) {
  return (
    <span className={`inline-flex text-current ${className}`.trim()} aria-hidden>
      {children}
    </span>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.25" cy="6.75" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M21.6 7.2c-.2-1-.9-1.8-1.9-2C17.8 4.8 12 4.8 12 4.8s-5.8 0-7.7.4c-1 .2-1.7 1-1.9 2C2 9.2 2 12 2 12s0 2.8.4 4.8c.2 1 .9 1.8 1.9 2 1.9.4 7.7.4 7.7.4s5.8 0 7.7-.4c1-.2 1.7-1 1.9-2 .4-2 .4-4.8.4-4.8s0-2.8-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zm4.7 16.1c-.2 0-.3 0-.4-.1-2.4-1.4-5.4-1.7-9-1-.4.1-.7-.2-.8-.5 0-.4.2-.7.5-.8 3.9-.8 7.2-.4 9.9 1.1.3.2.4.6.2.9-.1.2-.4.4-.6.4zm.6-3.5c-.2 0-.4-.1-.5-.2-2.7-1.6-6.9-2.1-10.1-1.1-.5.1-1-.2-1.1-.7-.1-.5.2-1 .7-1.1 3.6-1 8.3-.5 11.4 1.3.4.3.6.8.3 1.2-.2.3-.5.6-.9.6zm.1-3.7c-3.2-1.9-8.4-2.1-11.4-1.2-.6.2-1.2-.1-1.4-.7s.1-1.2.7-1.4c3.5-1 9.3-.8 12.9 1.3.5.3.7.9.4 1.4-.2.4-.7.7-1.2.6z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.5 1.6-1.5h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7v3.2h2.8V22h3.7z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M17.3 3H20l-6.5 7.4L21 21h-5.9l-4.6-6-5.3 6H3.1l7-7.9L3 3h5.9l4.1 5.4L17.3 3zm-2 16.1h1.6L8.4 4.8H6.7l8.6 14.3z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" d="M10 13a5 5 0 010-7l1-1a5 5 0 017 7l-1 1M14 11a5 5 0 010 7l-1 1a5 5 0 01-7-7l1-1" />
    </svg>
  )
}

export function SocialIcon({ label, href, className = '' }: { label: string; href: string; className?: string }) {
  const u = href.toLowerCase()
  const l = label.toUpperCase()

  if (l === 'IG' || u.includes('instagram')) return iconWrap(<InstagramIcon />, className)
  if (l === 'YT' || u.includes('youtube')) return iconWrap(<YoutubeIcon />, className)
  if (l === 'SP' || u.includes('spotify')) return iconWrap(<SpotifyIcon />, className)
  if (l === 'FB' || u.includes('facebook')) return iconWrap(<FacebookIcon />, className)
  if (l === 'X' || u.includes('twitter.com') || u.includes('x.com')) return iconWrap(<XIcon />, className)
  return iconWrap(<LinkIcon />, className)
}
