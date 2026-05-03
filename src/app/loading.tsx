export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <span className="animate-pulse font-playfair text-2xl italic text-[var(--body)]">Yadah</span>
        <div
          className="h-px w-24 origin-left animate-lineGrow"
          style={{ background: 'var(--gold)' }}
        />
      </div>
    </div>
  )
}
