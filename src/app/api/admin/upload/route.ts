import { NextRequest, NextResponse } from 'next/server'
import { getAdminJwt } from '@/lib/admin-auth'
import { isCloudinaryUploadConfigured, uploadImageBuffer } from '@/lib/cloudinary-server'
import { resolveImageMime } from '@/lib/upload-mime'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 12 * 1024 * 1024
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
])

const FOLDERS: Record<string, string> = {
  releases: 'yadahworld/releases',
  site: 'yadahworld/site',
  videos: 'yadahworld/videos',
  gallery: 'yadahworld/gallery',
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
  const folder = FOLDERS[folderKey]
  if (!folder) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 12MB)' }, { status: 400 })
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
