import { NextRequest, NextResponse } from 'next/server'
import { getAdminJwt } from '@/lib/admin-auth'
import { resolveAdminUploadFolder } from '@/lib/admin-cloudinary-folders'
import { isCloudinaryUploadConfigured, uploadImageBuffer } from '@/lib/cloudinary-server'
import { resolveImageMime } from '@/lib/upload-mime'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
/** Large hero images on slow connections */
export const maxDuration = 120

/** Keep small: hosts (e.g. Vercel) often reject bodies > ~4.5MB before this route runs. Prefer direct upload via `/api/admin/cloudinary-upload-params`. */
const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
])

/** Whether signed-in admin can upload (server has Cloudinary API credentials). */
export async function GET(req: NextRequest) {
  const token = await getAdminJwt(req)
  if (!token?.email && !token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const serverUploadReady = isCloudinaryUploadConfigured()
  const publicCloudNameSet = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim())
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? ''
  return NextResponse.json({ serverUploadReady, publicCloudNameSet, cloudName })
}

export async function POST(req: NextRequest) {
  const token = await getAdminJwt(req)
  if (!token?.email && !token?.sub) {
    return NextResponse.json({ error: 'Unauthorized — sign in again, then retry the upload.' }, { status: 401 })
  }

  if (!isCloudinaryUploadConfigured()) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const folderKey = String(formData.get('folder') ?? '')
  const folder = resolveAdminUploadFolder(folderKey)
  if (!folder) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error:
          'File too large for this upload path (max 4MB). The admin UI uses direct Cloudinary upload for larger files — refresh the page and try again.',
      },
      { status: 400 },
    )
  }

  const mime = resolveImageMime(file)
  if (!mime || !ALLOWED.has(mime)) {
    return NextResponse.json(
      {
        error:
          'Unsupported or unknown image type. Use JPEG, PNG, WebP, GIF, HEIC, or AVIF. If Windows hid the file type, rename with a .jpg / .png extension and try again.',
      },
      { status: 400 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { secure_url } = await uploadImageBuffer(buffer, { folder })
    return NextResponse.json({ url: secure_url })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
