export type AdminUploadFolder = 'releases' | 'site' | 'videos' | 'gallery' | 'products'

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

/**
 * Upload via XMLHttpRequest so `upload.onprogress` works (fetch has no upload progress).
 */
export function uploadAdminImage(
  file: File,
  folder: AdminUploadFolder,
  onProgress?: UploadProgressHandler,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/upload')
    xhr.withCredentials = true

    xhr.upload.onprogress = (evt) => {
      if (!onProgress) return
      if (evt.lengthComputable && evt.total > 0) {
        const pct = Math.min(100, Math.round((evt.loaded / evt.total) * 100))
        onProgress(pct)
      } else {
        onProgress(null)
      }
    }

    xhr.onload = () => {
      onProgress?.(100)
      let data: { url?: string; error?: string } = {}
      try {
        data = JSON.parse(xhr.responseText || '{}') as { url?: string; error?: string }
      } catch {
        data = {}
      }
      if (xhr.status === 401) {
        invalidateAdminUploadStatus()
        reject(new Error(data.error || 'Unauthorized — sign in again, then retry the upload.'))
        return
      }
      if (xhr.status === 503) {
        invalidateAdminUploadStatus()
        reject(
          new Error(
            data.error ||
              'Cloudinary is not configured on the server. Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME), then redeploy or restart.',
          ),
        )
        return
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(data.error || `Upload failed (${xhr.status})`))
        return
      }
      if (!data.url) {
        reject(new Error('Upload did not return a URL'))
        return
      }
      resolve(data.url)
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload cancelled'))

    const fd = new FormData()
    fd.set('file', file)
    fd.set('folder', folder)
    xhr.send(fd)
  })
}
