import type { ReactNode } from 'react'

import type { LessonItemType } from '../types/lessonItem.types'

type IconSize = 'sm' | 'md' | 'lg'

type TypeConfig = {
  iconBg: string
  icon: ReactNode
}

function sizeClasses(size: IconSize) {
  if (size === 'sm') {
    return { box: 'h-9 w-9 rounded-lg', text: 'text-base' }
  }

  if (size === 'lg') {
    return { box: 'h-14 w-14 rounded-2xl', text: 'text-2xl' }
  }

  return { box: 'h-11 w-11 rounded-xl', text: 'text-xl' }
}

function VocabularyGlyph({ className }: { className: string }) {
  return <span className={`font-bold text-violet-700 ${className}`}>A</span>
}

function PhraseGlyph() {
  return (
    <svg className="h-[55%] w-[55%] text-emerald-700" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 4h16a1 1 0 011 1v9a1 1 0 01-1 1h-5.5l-3.2 2.4a1 1 0 01-1.6-.8V15H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
    </svg>
  )
}

function AudioGlyph() {
  return (
    <svg className="h-[55%] w-[55%] text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14v-4a1 1 0 011-1h2l4-4v14l-4-4H5a1 1 0 01-1-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 9a4 4 0 010 6M18.5 6.5a7 7 0 010 11" />
    </svg>
  )
}

function CulturalNoteGlyph() {
  return (
    <svg className="h-[55%] w-[55%] text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
    </svg>
  )
}

const TYPE_CONFIG: Record<LessonItemType, TypeConfig> = {
  VOCABULARY: { iconBg: 'bg-violet-100', icon: null },
  PHRASE: { iconBg: 'bg-emerald-100', icon: <PhraseGlyph /> },
  AUDIO_LISTEN: { iconBg: 'bg-violet-100', icon: <AudioGlyph /> },
  CULTURAL_NOTE: { iconBg: 'bg-amber-100', icon: <CulturalNoteGlyph /> },
}

export const LESSON_ITEM_TYPE_OPTIONS: LessonItemType[] = ['VOCABULARY', 'PHRASE', 'AUDIO_LISTEN', 'CULTURAL_NOTE']

export function lessonItemTypeIconBg(type: LessonItemType): string {
  return TYPE_CONFIG[type].iconBg
}

export function lessonItemTypeIconNode(type: LessonItemType, size: IconSize = 'md'): ReactNode {
  const sizes = sizeClasses(size)
  const config = TYPE_CONFIG[type]
  return type === 'VOCABULARY' ? <VocabularyGlyph className={sizes.text} /> : config.icon
}

export function lessonItemTypeIconBoxClass(type: LessonItemType, size: IconSize = 'md'): string {
  return `${TYPE_CONFIG[type].iconBg} ${sizeClasses(size).box}`
}

export function lessonItemTypeIconContent(type: LessonItemType, size: IconSize = 'md'): ReactNode {
  return lessonItemTypeIconNode(type, size)
}
