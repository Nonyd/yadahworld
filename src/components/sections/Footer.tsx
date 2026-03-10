"use client";

const FOOTER_NAV = [
  { label: "Music", href: "#music" },
  { label: "Tour", href: "#tour" },
  { label: "Story", href: "#story" },
  { label: "Ministry", href: "#ministry" },
];

const SOCIALS = [
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "TikTok", href: "#", icon: "tiktok" },
  { label: "YouTube", href: "#", icon: "youtube" },
  { label: "Spotify", href: "#", icon: "spotify" },
  { label: "Facebook", href: "#", icon: "facebook" },
];

export default function Footer() {
  return (
    <footer className="py-16 px-6 bg-[var(--bg)] border-t border-[var(--muted)]/30">
      <div className="max-w-4xl mx-auto text-center">
        <a
          href="#hero"
          className="inline-block font-serif text-2xl italic text-gold mb-10"
        >
          YADAH
        </a>

        <nav className="flex flex-wrap justify-center gap-8 mb-10">
          {FOOTER_NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--ivory)]/80 hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {SOCIALS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[var(--ivory)]/70 hover:text-gold transition-colors text-sm"
              aria-label={label}
            >
              {label}
            </a>
          ))}
        </div>

        <p className="font-serif text-lg italic text-[var(--ivory)]/80 mb-6">
          All glory. All light. All Yadah.
        </p>

        <p className="text-[var(--muted)] text-sm mb-6">
          © 2025 SonsHub Media | Yadah Ahfreekah
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <a
            href="#"
            className="text-[var(--muted)] hover:text-[var(--ivory)] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-[var(--muted)] hover:text-[var(--ivory)] transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
