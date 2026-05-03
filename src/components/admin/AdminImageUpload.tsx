'use client'

import { useEffect, useId, useState } from 'react'
import {
  getAdminUploadStatus,
  uploadAdminImage,
  type AdminUploadFolder,
  type AdminUploadStatus,
} from '@/lib/admin-upload-client'

type Props = {
  label: string
  description?: string
  value: string
  onChange: (url: string) => void
  folder: AdminUploadFolder
  hint?: string
  urlPlaceholder?: string
}

function UploadProgressBar({ value }: { value: number | null }) {
  const indeterminate = value === null
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-admin-border" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={indeterminate ? undefined : value ?? 0}>
      <div
        className={`h-full rounded-full bg-admin-accent transition-[width] duration-150 ease-out ${indeterminate ? 'w-1/3 animate-pulse' : ''}`}
        style={!indeterminate ? { width: `${Math.min(100, Math.max(0, value ?? 0))}%` } : undefined}
      />
    </div>
  )
}

export default function AdminImageUpload({ label, description, value, onChange, folder, hint, urlPlaceholder }: Props) {
  const inputId = useId()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [status, setStatus] = useState<AdminUploadStatus | null>(null)

  useEffect(() => {
    void getAdminUploadStatus().then(setStatus)
  }, [])

  const uploadsEnabled = status?.serverUploadReady === true
  const checkingStatus = status === null

  const onPick = async (file: File | undefined) => {
    if (!file) return
    setErr('')
    setBusy(true)
    setProgress(0)
    try {
      const url = await uploadAdminImage(file, folder, (p) => setProgress(p))
      onChange(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const displayCloud = status?.cloudName?.trim()

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
          disabled={!uploadsEnabled || busy || checkingStatus}
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            void onPick(f)
          }}
        />
        <label
          htmlFor={`${inputId}-file`}
          className={`admin-btn admin-btn-secondary inline-flex cursor-pointer text-[10px] ${
            !uploadsEnabled || busy || checkingStatus ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {checkingStatus ? 'Checking…' : busy ? 'Uploading…' : 'Upload image'}
        </label>
      </div>
      {busy ? <UploadProgressBar value={progress} /> : null}
      <input
        id={`${inputId}-url`}
        className="admin-input mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={urlPlaceholder ?? 'Or paste an image URL (any host)'}
      />
      {status && !uploadsEnabled ? (
        <p className="mt-2 text-xs text-amber-800">
          {status.publicCloudNameSet ? (
            <>
              The public cloud name is set, but this server is missing <span className="font-mono">CLOUDINARY_API_KEY</span> and/or{' '}
              <span className="font-mono">CLOUDINARY_API_SECRET</span>. Add them to <span className="font-mono">.env</span> (local) or your host&apos;s
              environment, then restart the app. You can still paste image URLs.
            </>
          ) : (
            <>
              Set <span className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</span>, <span className="font-mono">CLOUDINARY_API_KEY</span>, and{' '}
              <span className="font-mono">CLOUDINARY_API_SECRET</span> to enable uploads. You can still paste URLs.
            </>
          )}
        </p>
      ) : null}
      {displayCloud && uploadsEnabled ? (
        <p className="mt-1 text-xs text-admin-muted">
          Cloudinary: <span className="font-mono text-[11px] text-admin-text">{displayCloud}</span>
        </p>
      ) : null}
      {hint && !err && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
      {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
    </div>
  )
}
