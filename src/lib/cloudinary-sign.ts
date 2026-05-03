import { createHash } from 'crypto'

/**
 * Cloudinary signed upload — parameters must match what is POSTed (except `file` and `api_key`).
 * @see https://cloudinary.com/documentation/authentication#generating_authentication_signatures
 */
export function signCloudinaryUploadParams(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(toSign + apiSecret).digest('hex')
}
