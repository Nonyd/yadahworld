'use client'

import { useId, useState } from 'react'
import { cloudinaryCloudName } from '@/lib/cloudinary'
import { uploadAdminImage, type AdminUploadFolder } from '@/lib/admin-upload-client'

type Props = {
  label: string
  description?: string
  value: string
  onChange: (url: string) => void
  folder: AdminUploadFolder
  hint?: string
  urlPlaceholder?: string
}

export default function AdminImageUpload({ label, description, value, onChange, folder, hint, urlPlaceholder }: Props) {
  const inputId = useId()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const uploadsEnabled = Boolean(cloudinaryCloudName)

  const onPick = async (file: File | undefined) => {
    if (!file) return
    setErr('')
    setBusy(true)
    try {
      const url = await uploadAdminImage(file, folder)
      onChange(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-admin-border/80 bg-admin-bg/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <label className="admin-label" htmlFor={`${inputId}-url`}>
            {label}
          </label>
          {description ? <p className="mt-1 max-w-xl text-xs text-admin-muted">{description}</p> : null}
        </div>
        {value ? (
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-admin-border text-admin-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            onClick={() => onChange('')}
            aria-label="Remove image"
            title="Remove"
          >
            ×
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="relative mt-3 max-h-[80px] max-w-xs overflow-hidden rounded border border-admin-border bg-admin-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin arbitrary CDN URLs */}
          <img src={value} alt="" className="max-h-[80px] w-auto object-contain object-left" />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          id={`${inputId}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif,.heic,.heif"
          className="sr-only"
          disabled={!uploadsEnabled || busy}
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            void onPick(f)
          }}
        />
        <label
          htmlFor={`${inputId}-file`}
          className={`admin-btn admin-btn-secondary inline-flex cursor-pointer text-[10px] ${
            !uploadsEnabled || busy ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {busy ? 'Uploading…' : 'Upload image'}
        </label>
      </div>
      <input
        id={`${inputId}-url`}
        className="admin-input mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={urlPlaceholder ?? 'Or paste an image URL (any host)'}
      />
      {!uploadsEnabled && (
        <p className="mt-1 text-xs text-admin-muted">
          Set <span className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</span> and server API keys in{' '}
          <span className="font-mono">.env</span> to enable uploads. You can still paste URLs.
        </p>
      )}
      {hint && !err && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
      {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
    </div>
  )
}
