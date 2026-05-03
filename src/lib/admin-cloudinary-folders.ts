/** Allowed Cloudinary folder keys for admin uploads (site + CMS). */
export const ADMIN_CLOUDINARY_FOLDERS: Record<string, string> = {
  releases: 'yadahworld/releases',
  site: 'yadahworld/site',
  videos: 'yadahworld/videos',
  gallery: 'yadahworld/gallery',
  products: 'yadahworld/products',
}

export function resolveAdminUploadFolder(folderKey: string): string | undefined {
  return ADMIN_CLOUDINARY_FOLDERS[folderKey]
}
