export type AdminUploadFolder = 'releases' | 'site' | 'videos' | 'gallery'

export async function uploadAdminImage(file: File, folder: AdminUploadFolder): Promise<string> {
  const fd = new FormData()
  fd.set('file', file)
  fd.set('folder', folder)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  if (!data.url) throw new Error('Upload did not return a URL')
  return data.url
}
