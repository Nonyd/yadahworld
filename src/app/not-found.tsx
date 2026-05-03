export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8" style={{ background: 'var(--bg)' }}>
      <p className="eyebrow mb-4">404</p>
      <h1 className="display-2 mb-6 text-center text-[var(--body)]">Page not found.</h1>
      <p className="body-lg mb-10 max-w-sm text-center">The page you are looking for does not exist or has been moved.</p>
      <a href="/" className="btn-primary">
        Return Home
      </a>
    </div>
  )
}
