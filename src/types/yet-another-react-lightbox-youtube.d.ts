import type { GenericSlide } from 'yet-another-react-lightbox'

type YoutubeSlide = GenericSlide & {
  type: 'youtube'
  youtubeId: string
  poster?: string
  title?: string
}

declare module 'yet-another-react-lightbox' {
  interface SlideTypes {
    youtube: YoutubeSlide
  }
}

export {}
