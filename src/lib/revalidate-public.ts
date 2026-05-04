import { revalidatePath } from 'next/cache'

/** Public routes that read cached playlist / featured video data. */
export function revalidateMediaAndMinistrations() {
  try {
    revalidatePath('/media')
    revalidatePath('/ministrations')
    revalidatePath('/')
    revalidatePath('/', 'layout')
  } catch (e) {
    console.warn('revalidatePath (media/ministrations/home):', e)
  }
}
