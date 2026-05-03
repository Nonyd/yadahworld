'use client'

import { useId, useState } from 'react'
import { cloudinaryCloudName } from '@/lib/cloudinary'
import { uploadAdminImage, type AdminUploadFolder } from '@/lib/admin-upload-client'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  folder: AdminUploadFolder
  hint?: string
  urlPlaceholder?: string
}

export default function AdminImageUpload({ label, value, onChange, folder, hint, urlPlaceholder }: Props) {
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
    <div>
      <label className="admin-label" htmlFor={`${inputId}-url`}>
        {label}
      </label>
      {value ? (
        <div className="relative mt-2 max-h-48 max-w-xs overflow-hidden rounded-lg border border-admin-border bg-admin-bg">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin arbitrary CDN URLs */}
          <img src={value} alt="" className="max-h-48 w-full object-contain object-left" />
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          id={`${inputId}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
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
        {value ? (
          <button type="button" className="admin-btn admin-btn-ghost text-[10px]" onClick={() => onChange('')}>
            Clear
          </button>
        ) : null}
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
