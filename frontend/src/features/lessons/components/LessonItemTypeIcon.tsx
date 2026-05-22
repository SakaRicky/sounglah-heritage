import { useI18n } from '../../../i18n'
import type { LessonItemType } from '../types/lessonItem.types'
import { lessonItemTypeIconBoxClass, lessonItemTypeIconContent } from '../utils/lessonItemTypeVisual'

type Props = {
  type: LessonItemType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

export function LessonItemTypeIcon({ type, size = 'md', showLabel = false, label }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex shrink-0 items-center justify-center ${lessonItemTypeIconBoxClass(type, size)}`}>
        {lessonItemTypeIconContent(type, size)}
      </div>
      {showLabel && label ? <span className="text-sm font-semibold text-cocoa-800">{label}</span> : null}
    </div>
  )
}

export function LessonItemTypeSelector({ value, disabled = false, onChange }: {
  value: LessonItemType
  disabled?: boolean
  onChange: (type: LessonItemType) => void
}) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {(['VOCABULARY', 'PHRASE', 'AUDIO_LISTEN', 'CULTURAL_NOTE'] as LessonItemType[]).map((optionType) => {
        const selected = optionType === value

        return (
          <button
            key={optionType}
            type="button"
            disabled={disabled}
            onClick={() => onChange(optionType)}
            className={[
              'relative rounded-2xl border-2 px-3 py-4 text-center transition',
              selected
                ? 'border-forest-accent bg-forest-50/40 shadow-[0_0_0_1px_rgba(15,107,58,0.08)]'
                : 'border-sand-200 bg-cream-50/50 hover:border-forest-accent/30 hover:bg-white',
              disabled ? 'cursor-default opacity-80' : '',
            ].join(' ')}
          >
            {selected ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-forest-accent text-white shadow-md">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : null}
            <div className={`mx-auto flex items-center justify-center ${lessonItemTypeIconBoxClass(optionType, 'lg')}`}>
              {lessonItemTypeIconContent(optionType, 'lg')}
            </div>
            <p className="mt-3 text-sm font-semibold text-cocoa-800">{t(`admin.lessons.items.type.${optionType}`)}</p>
          </button>
        )
      })}
    </div>
  )
}
