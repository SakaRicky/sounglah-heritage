import { resolveMediaUrl } from '../../lib/media'

type ImagePreviewProps = {
  src?: string | null
  alt: string
}

type AudioPreviewProps = {
  src?: string | null
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const resolvedSrc = resolveMediaUrl(src)

  if (!resolvedSrc) {
    return <span className="text-xs font-medium text-cocoa-body/50">No image</span>
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className="h-11 w-11 rounded-lg border border-sand-200 bg-white object-cover"
      loading="lazy"
    />
  )
}

export function AudioPreview({ src }: AudioPreviewProps) {
  const resolvedSrc = resolveMediaUrl(src)

  if (!resolvedSrc) {
    return <span className="text-xs font-medium text-cocoa-body/50">No audio</span>
  }

  return (
    <audio
      src={resolvedSrc}
      controls
      className="h-8 w-44 max-w-full"
      preload="none"
    >
      <a href={resolvedSrc}>Audio</a>
    </audio>
  )
}
