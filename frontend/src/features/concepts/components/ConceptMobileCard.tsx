import { useEffect, useRef, useState } from 'react'
import { Eye, MoreVertical, Pencil, Power, PowerOff, Upload } from 'lucide-react'

import { resolveMediaUrl } from '../../../lib/media'
import { ConceptDifficultyBadge } from './ConceptDifficultyBadge'
import { ConceptStatusBadge } from './ConceptStatusBadge'
import type { Concept } from '../types/concept.types'

type Props = {
  concept: Concept
  onEdit: (concept: Concept) => void
  onPreviewTexts: (concept: Concept) => void
  onToggleStatus: (concept: Concept) => void
  onQuickImageSelect: (concept: Concept, file: File) => void
  uploading: boolean
}

const gradientColors = [
  'from-forest-accent/20 to-forest-accent/5 border-forest-accent/20 text-forest-700',
  'from-gold-400/25 to-gold-400/5 border-gold-500/20 text-cocoa-700',
  'from-terracotta-400/20 to-terracotta-400/5 border-terracotta-500/20 text-terracotta-600',
  'from-forest-200/40 to-forest-50/20 border-forest-300/30 text-forest-600',
]

export function ConceptMobileCard({
  concept,
  onEdit,
  onPreviewTexts,
  onToggleStatus,
  onQuickImageSelect,
  uploading,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isActive = concept.status === 'active'
  const initial = concept.title.slice(0, 1).toUpperCase()
  const colorClass = gradientColors[initial.charCodeAt(0) % gradientColors.length]
  const imageUrl = resolveMediaUrl(concept.image_url)

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onQuickImageSelect(concept, file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <article
      className={[
        'overflow-hidden rounded-3xl border bg-white/95 p-5 shadow-[0_12px_30px_rgba(47,26,16,0.06)] transition-all duration-300',
        isActive ? 'border-sand-200' : 'border-sand-200/60 opacity-60 bg-sand-50/45',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Responsive Image Upload / Avatar */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title={concept.image_url ? 'Change concept image' : 'Upload concept image'}
              className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-cream-50 shadow-soft transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-wait"
            >
              {uploading ? (
                <span className="text-[10px] font-bold text-forest-700 animate-pulse">Uploading…</span>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={concept.image_alt_text || concept.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className={['flex h-full w-full items-center justify-center bg-gradient-to-br text-xl font-bold', colorClass].join(' ')}>
                  {initial}
                </span>
              )}
              {/* Hover overlay icon */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Upload className="h-4 w-4 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-cocoa-body/75 ring-1 ring-sand-100">
                {concept.key}
              </span>
              {concept.category ? (
                <span className="text-xs font-semibold text-forest-600/75">
                  📁 {concept.category}
                </span>
              ) : null}
            </div>
            <h3 className="mt-1 text-lg font-bold leading-snug tracking-tight text-cocoa-800">
              {concept.title}
            </h3>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sand-200 bg-white text-cocoa-body/65 shadow-soft transition hover:border-forest-300 hover:text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-200"
            aria-label={`More actions for ${concept.title}`}
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-1.5 w-44 rounded-xl border border-sand-200 bg-white p-1.5 shadow-card text-left animate-in fade-in duration-100">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onPreviewTexts(concept)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100 hover:text-forest-700"
              >
                <Eye className="h-4 w-4" />
                View Texts
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onEdit(concept)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100 hover:text-forest-700"
              >
                <Pencil className="h-4 w-4" />
                Edit Concept
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onToggleStatus(concept)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-cocoa-body transition hover:bg-cream-100 hover:text-terracotta-600"
              >
                {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                {isActive ? 'Disable' : 'Enable'}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Description & Badges */}
      {concept.description ? (
        <p className="mt-3.5 text-sm leading-relaxed text-cocoa-body/75 whitespace-normal break-words">
          {concept.description}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ConceptDifficultyBadge difficulty={concept.difficultyLevel} />
        <ConceptStatusBadge status={concept.status} />
      </div>
    </article>
  )
}
