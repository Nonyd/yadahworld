import { NextRequest, NextResponse } from 'next/server'
import { getAdminJwt } from '@/lib/admin-auth'
import { resolveAdminUploadFolder } from '@/lib/admin-cloudinary-folders'
import { isCloudinaryUploadConfigured } from '@/lib/cloudinary-server'
import { signCloudinaryUploadParams } from '@/lib/cloudinary-sign'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = { folder?: string }

/**
 * Returns a short-lived signature so the browser can POST the file directly to Cloudinary,
 * avoiding Next.js / Vercel request body limits (413) on large images.
 */
export async function POST(req: NextRequest) {
  const token = await getAdminJwt(req)
  if (!token?.email && !token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCloudinaryUploadConfigured()) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' },
      { status: 503 },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const folderKey = String(body.folder ?? '')
  const folder = resolveAdminUploadFolder(folderKey)
  if (!folder) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey = process.env.CLOUDINARY_API_KEY
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary configuration incomplete' }, { status: 503 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  /** Keep signing minimal — every key here must be sent on the multipart upload to Cloudinary. */
  const paramsToSign: Record<string, string> = {
    folder,
    allowed_formats: 'jpg,jpeg,png,webp,gif,heic,heif,avif',
    timestamp: String(timestamp),
  }

  const signature = signCloudinaryUploadParams(paramsToSign, apiSecret)

  await logAdminApiActivity(null, {
    method: 'POST',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
    actorEmail: typeof token.email === 'string' ? token.email : null,
  })
  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    folderKey,
    allowedFormats: paramsToSign.allowed_formats.split(','),
  })
}
