export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''

export function cloudinaryUrl(publicId: string, opts?: { width?: number; quality?: string }) {
  if (!cloudinaryCloudName) return ''
  const w = opts?.width ? `,w_${opts.width}` : ''
  const q = opts?.quality ? `,q_${opts.quality}` : ',q_auto'
  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/f_auto${q}${w}/${publicId}`
}
