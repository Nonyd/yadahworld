export type AdminUploadFolder = 'releases' | 'site' | 'videos' | 'gallery' | 'products' | 'events'

export type AdminUploadStatus = {
  serverUploadReady: boolean
  publicCloudNameSet: boolean
  /** From server (public env); optional display hint */
  cloudName?: string
}

let uploadStatusCache: AdminUploadStatus | null = null
let uploadStatusInflight: Promise<AdminUploadStatus> | null = null

export function invalidateAdminUploadStatus() {
  uploadStatusCache = null
  uploadStatusInflight = null
}

/** Cached per session so multiple `AdminImageUpload` fields do not spam GET. */
export async function getAdminUploadStatus(): Promise<AdminUploadStatus> {
  if (uploadStatusCache) return uploadStatusCache
  if (uploadStatusInflight) return uploadStatusInflight
  uploadStatusInflight = (async () => {
    try {
      const res = await fetch('/api/admin/upload', { method: 'GET', credentials: 'include' })
      if (res.status === 401) {
        return { serverUploadReady: false, publicCloudNameSet: false }
      }
      if (!res.ok) {
        const fallback: AdminUploadStatus = { serverUploadReady: false, publicCloudNameSet: false }
        uploadStatusCache = fallback
        return fallback
      }
      const data = (await res.json().catch(() => ({}))) as Partial<AdminUploadStatus> & {
        cloudName?: string
      }
      const status: AdminUploadStatus = {
        serverUploadReady: Boolean(data.serverUploadReady),
        publicCloudNameSet: Boolean(data.publicCloudNameSet),
        cloudName: typeof data.cloudName === 'string' ? data.cloudName : undefined,
      }
      uploadStatusCache = status
      return status
    } catch {
      const fallback: AdminUploadStatus = { serverUploadReady: false, publicCloudNameSet: false }
      uploadStatusCache = fallback
      return fallback
    } finally {
      uploadStatusInflight = null
    }
  })()
  return uploadStatusInflight
}

export type UploadProgressHandler = (percent: number | null) => void

type SignedParams = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
  /** Must be POSTed with the same comma-separated value the server signed. */
  allowedFormats?: string[]
}

function parseCloudinaryUploadResponse(text: string): { secure_url?: string; error?: string } {
  try {
    const j = JSON.parse(text || '{}') as {
      secure_url?: string
      error?: { message?: string } | string
    }
    if (j.error) {
      const msg = typeof j.error === 'string' ? j.error : j.error.message
      return { error: msg || 'Cloudinary rejected the upload' }
    }
    return { secure_url: j.secure_url }
  } catch {
    return { error: 'Invalid response from Cloudinary' }
  }
}

/**
 * Upload images directly to Cloudinary from the browser (multipart goes to Cloudinary, not Next.js),
 * avoiding **413 Payload Too Large** on Vercel and similar hosts. Uses a small signed request to this app first.
 * Progress uses `xhr.upload` on the Cloudinary leg only.
 */
export function uploadAdminImage(
  file: File,
  folder: AdminUploadFolder,
  onProgress?: UploadProgressHandler,
): Promise<string> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        const pRes = await fetch('/api/admin/cloudinary-upload-params', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder }),
        })
        const pData = (await pRes.json().catch(() => ({}))) as SignedParams & { error?: string }
        if (!pRes.ok) {
          if (pRes.status === 401) invalidateAdminUploadStatus()
          if (pRes.status === 503) invalidateAdminUploadStatus()
          reject(new Error(pData.error || `Could not start upload (${pRes.status})`))
          return
        }
        if (!pData.signature || !pData.apiKey || !pData.cloudName || !pData.folder) {
          reject(new Error(pData.error || 'Invalid upload parameters from server'))
          return
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(pData.cloudName)}/image/upload`
        const xhr = new XMLHttpRequest()
        xhr.open('POST', uploadUrl)

        xhr.upload.onprogress = (evt) => {
          if (!onProgress) return
          if (evt.lengthComputable && evt.total > 0) {
            onProgress(Math.min(100, Math.round((evt.loaded / evt.total) * 100)))
          } else {
            onProgress(null)
          }
        }

        xhr.onload = () => {
          onProgress?.(100)
          const out = parseCloudinaryUploadResponse(xhr.responseText)
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error(out.error || `Upload failed (${xhr.status})`))
            return
          }
          if (!out.secure_url) {
            reject(new Error(out.error || 'Upload did not return a URL'))
            return
          }
          resolve(out.secure_url)
        }

        xhr.onerror = () => reject(new Error('Network error while uploading to Cloudinary'))
        xhr.onabort = () => reject(new Error('Upload cancelled'))

        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', pData.apiKey)
        fd.append('timestamp', String(pData.timestamp))
        fd.append('signature', pData.signature)
        fd.append('folder', pData.folder)
        if (pData.allowedFormats?.length) {
          fd.append('allowed_formats', pData.allowedFormats.join(','))
        }
        xhr.send(fd)
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Upload failed'))
      }
    })()
  })
}
