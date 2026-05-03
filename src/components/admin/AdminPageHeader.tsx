export default function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-playfair text-3xl font-normal tracking-tight text-admin-text md:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-admin-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
