import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Gospel',
  description: 'The good news of Jesus Christ — scripture, invitation, and a simple prayer.',
}

function ScriptureQuote({ text, cite }: { text: string; cite: string }) {
  return (
    <blockquote className="border-l-2 border-[var(--gold)] pl-6 my-8 font-baskerville italic text-lg text-[var(--body)]">
      {text}
      <cite className="font-jost text-xs tracking-widest uppercase text-[var(--gold)] mt-3 block not-italic">{cite}</cite>
    </blockquote>
  )
}

export default function GospelPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--white)' }}>
      <article className="mx-auto max-w-2xl pt-40 pb-32 px-8 text-[var(--body)]">
        <header className="text-center mb-20">
          <p className="eyebrow mb-6">A Message from Yadah</p>
          <h1 className="font-playfair text-[clamp(2.25rem,6vw,3.5rem)] font-normal leading-tight text-[var(--body)]">
            The Best News You Will Ever Hear.
          </h1>
        </header>

        <section>
          <div className="mx-auto mb-10 h-px w-12 bg-[var(--gold)]" aria-hidden />
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)]">
            We were all born separated from God. Not because He abandoned us — but because sin created a distance between us
            and Him. And no amount of good works, religion, or effort could bridge that gap.
          </p>
          <ScriptureQuote text="For all have sinned and fall short of the glory of God." cite="— Romans 3:23" />
        </section>

        <section className="mt-16">
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)]">
            But God, in His immeasurable love, did something extraordinary. He sent His Son — Jesus Christ — to live the life
            we couldn&apos;t live, and die the death we deserved. On the cross, Jesus took our sin, our shame, and our
            separation — and replaced it with His righteousness.
          </p>
          <ScriptureQuote
            text="For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life."
            cite="— John 3:16"
          />
        </section>

        <section className="mt-16">
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)]">
            Salvation is not earned. It is received. All you have to do is believe — truly believe — that Jesus is Lord, that
            He died for your sins, and that God raised Him from the dead.
          </p>
          <ScriptureQuote
            text="If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved."
            cite="— Romans 10:9"
          />
        </section>

        <section className="mt-20 border-t border-[var(--gold)] pt-16 text-center">
          <p className="eyebrow mb-8">A Simple Prayer</p>
          <p className="font-playfair text-xl md:text-2xl font-normal italic leading-relaxed text-[var(--body)] max-w-xl mx-auto">
            Lord Jesus, I believe You are the Son of God.
            <br />
            I believe You died for my sins and rose again.
            <br />
            I receive You as my Lord and Saviour.
            <br />
            Forgive me of my sins and give me a new life.
            <br />I am Yours.
            <br />
            Amen.
          </p>
        </section>

        <section className="mt-20">
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)] mb-6">
            If you just prayed that prayer and meant it — welcome to the family of God. Your life will never be the same.
          </p>
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)] mb-10">
            We would love to hear from you. Reach out to Yadah&apos;s team and let us know. We want to celebrate with you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              Get in Touch
            </Link>
            <Link href="/releases" className="btn-ghost">
              <span className="arrow-line" />
              Explore Yadah&apos;s Music
            </Link>
          </div>
          <ScriptureQuote
            text="Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"
            cite="— 2 Corinthians 5:17"
          />
        </section>
      </article>
    </div>
  )
}
