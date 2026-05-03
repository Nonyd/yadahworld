import { v2 as cloudinary } from 'cloudinary'

let configured = false

export function isCloudinaryUploadConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  )
}

function ensureConfigured() {
  if (configured) return
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary is not configured')
  }
  cloudinary.config({ cloud_name, api_key, api_secret })
  configured = true
}

export async function uploadImageBuffer(
  buffer: Buffer,
  opts: { folder: string },
): Promise<{ secure_url: string; public_id: string }> {
  ensureConfigured()
  const folder = opts.folder.replace(/[^a-zA-Z0-9-_/]/g, '').slice(0, 120) || 'yadahworld/misc'

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      },
      (err, res) => {
        if (err) reject(err)
        else if (!res?.secure_url) reject(new Error('Cloudinary returned no URL'))
        else resolve({ secure_url: res.secure_url, public_id: res.public_id })
      },
    )
    stream.end(buffer)
  })

  return result
}
